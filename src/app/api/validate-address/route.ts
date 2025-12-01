import { NextRequest, NextResponse } from 'next/server';
import { addressSchema, formatZodError } from '@/lib/validations';

// ZIP codes we service in the Oakleaf / Argyle / Eagle Landing area
const ALLOWED_ZIPS = ['32222', '32244', '32065', '32068'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input with Zod
    const parseResult = addressSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: formatZodError(parseResult.error) },
        { status: 400 }
      );
    }
    
    const { street, city, state, zip } = parseResult.data;

    // 1) Check against your service area first
    if (!ALLOWED_ZIPS.includes(zip)) {
      return NextResponse.json(
        {
          error:
            'Sorry, we currently only serve the Oakleaf, Argyle, and Eagle Landing areas in Jacksonville.',
        },
        { status: 400 }
      );
    }

    // 2) Build USPS XML request
    const userId = process.env.USPS_USER_ID;
    if (!userId) {
      // If USPS is not configured, just validate the ZIP is in our list
      console.warn('USPS_USER_ID not configured, skipping USPS validation');
      return NextResponse.json({
        success: true,
        normalizedAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.toUpperCase(),
          zip,
        },
      });
    }

    const xml = `
      <AddressValidateRequest USERID="${userId}">
        <Revision>1</Revision>
        <Address ID="0">
          <Address1></Address1>
          <Address2>${escapeXml(street)}</Address2>
          <City>${escapeXml(city)}</City>
          <State>${escapeXml(state)}</State>
          <Zip5>${zip}</Zip5>
          <Zip4></Zip4>
        </Address>
      </AddressValidateRequest>
    `.trim();

    const url =
      'https://secure.shippingapis.com/ShippingAPI.dll' +
      '?API=Verify' +
      `&XML=${encodeURIComponent(xml)}`;

    const uspsRes = await fetch(url);
    const text = await uspsRes.text();

    // Quick check for USPS error - but still allow if ZIP is in service area
    if (text.includes('<Error>')) {
      // USPS couldn't validate, but since ZIP is in our whitelist, allow with original input
      console.warn('USPS validation failed, but ZIP is in service area. Allowing booking.');
      return NextResponse.json({
        success: true,
        warning: 'Address could not be verified with USPS, but ZIP is in our service area.',
        normalizedAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.toUpperCase(),
          zip,
        },
      });
    }

    // Extract fields from the XML response
    const parsed = parseUspsAddress(text);

    if (!parsed) {
      // Couldn't parse USPS response, but ZIP is valid - allow it
      console.warn('Could not parse USPS response, but ZIP is in service area. Allowing booking.');
      return NextResponse.json({
        success: true,
        warning: 'Address could not be fully verified.',
        normalizedAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.toUpperCase(),
          zip,
        },
      });
    }

    const {
      zip5: uspsZip,
      city: uspsCity,
      state: uspsState,
      address2: uspsStreet,
    } = parsed;

    // Compare USPS result with user input
    if (uspsZip !== zip) {
      return NextResponse.json(
        {
          error:
            "The ZIP code doesn't match the address. Please make sure your street/city and ZIP go together.",
        },
        { status: 400 }
      );
    }

    if (uspsState.toUpperCase() !== state.toUpperCase()) {
      return NextResponse.json(
        {
          error:
            "The state doesn't match the address we found. Please double-check your state.",
        },
        { status: 400 }
      );
    }

    // Check city loosely – USPS might normalize (e.g. JACKSONVILLE vs Jacksonville)
    if (
      uspsCity.toUpperCase() !== city.trim().toUpperCase() &&
      !uspsCity.toUpperCase().startsWith(city.trim().toUpperCase())
    ) {
      return NextResponse.json(
        {
          error:
            "The city doesn't match this ZIP and street. Please double-check your city name.",
        },
        { status: 400 }
      );
    }

    // If we got here, address is valid + inside service area
    return NextResponse.json({
      success: true,
      normalizedAddress: {
        street: uspsStreet,
        city: uspsCity,
        state: uspsState,
        zip: uspsZip,
      },
    });
  } catch (err) {
    console.error('USPS validation error:', err);
    return NextResponse.json(
      { error: 'Something went wrong validating the address.' },
      { status: 500 }
    );
  }
}

/**
 * Escape special XML characters in address fields
 */
function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Lightweight XML parsing for USPS response
 */
function parseUspsAddress(xml: string) {
  const zip5 = matchTag(xml, 'Zip5');
  const city = matchTag(xml, 'City');
  const state = matchTag(xml, 'State');
  const address2 = matchTag(xml, 'Address2');

  if (!zip5 || !city || !state || !address2) return null;
  return { zip5, city, state, address2 };
}

function matchTag(xml: string, tag: string) {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}
