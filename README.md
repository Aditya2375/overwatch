# Overwatch

Live: https://overwatch-topaz.vercel.app/

A public-data observatory with an interactive 3D orthographic globe, regional aircraft and AIS reports, an ISS orbital position, explicit source times, typed commands and optional voice commands. No made-up traffic or animated dead reckoning.

## Scope

- Aircraft: adsb.fi, 150 nautical miles around Helsinki (60.16,24.94), personal/non-commercial use only. Reports expire after 120 seconds. Receiver coverage is not complete. A fixed-path serverless proxy handles browser CORS, coalesces concurrent requests in one instance and caches successful results for 60 seconds. CDN cache is also requested. It is not a global distributed rate limiter. A provider HTTP error disables further upstream reads in that warm instance, but a cold instance may try again.
- Vessels: Fintraffic / Digitraffic AIS, 100 km around Helsinki, source `timestampExternal` in milliseconds is used, not AIS second-of-minute `timestamp`. Reports older than 10 minutes are excluded. Values are filtered and mapped, not corrected or extrapolated. Names are not invented: MMSI is shown.
- Space: Where the ISS at? source-calculated ISS position, not direct satellite telemetry. Expires after 120 seconds. Only ISS, not a complete satellite catalog.
- Globe: original Canvas spherical projection/rotation and hemisphere clipping with public-domain Natural Earth linework. Air heights are exaggerated for visibility. Chart arrows are symbolic and should not be used to infer projected heading or navigation accuracy.
- Controls: drag/keyboard rotation, wheel/+/- zoom, Baltic/ISS/global views, layer switches, searchable report list, marker/report inspection, allowlisted typed commands and optional browser speech recognition.

## Refresh and failure

Initial fetch is explicit. Optional refresh every two minutes, only while visible. Manual requests have the same two-minute guard. No account, API keys, geolocation or credentials. Third-party providers see IP and requested region; aircraft reads are proxied. Voice starts only after an explicit click; the browser may use a remote recognition service, and permission/service availability varies. Typed controls always work. No promise that voice works on every browser.

Each feed has its own timeout and error state. An unavailable source contributes no fake substitute. Expired coordinates are excluded from the globe and report list even without a refresh. Source freshness is separate from fetch time. This is not suitable for navigation, safety, operational decisions, worldwide coverage or reliable service monitoring. Providers are best-effort and can withdraw access.

OpenSky was deliberately not used: current terms require prior written permission for operational live REST integration. CelesTrak returned HTTP500 during this build; its usage policy says to stop on errors, so no retry loop was created. ISS is explicitly labelled a calculated position rather than pretended live telemetry.

## Source terms and attribution

- adsb.fi, as-is/no warranty, personal non-commercial use; do not license/sell/rent/lease its data/service. Credit https://adsb.fi/ . Current endpoint/terms: https://github.com/adsbfi/opendata/blob/main/README.md . API public rate limit1/s; this application asks once per2minutes and fixed proxy cache60s, not global coverage. No data snapshot is committed to the repository.
- Fintraffic / Digitraffic, CC BY4.0, no warranty. Filtered to fresh points and mapped. Source https://www.digitraffic.fi/en/marine-traffic/ ; terms https://www.digitraffic.fi/en/terms-of-service ; license https://creativecommons.org/licenses/by/4.0/ . Compression and application header per https://www.digitraffic.fi/en/support/instructions/ . No personal data in application header.
- Where the ISS at? API: https://wheretheiss.at/w/developer . Public keyless API, documented limit~1/s; application uses2minute guard.
- Natural Earth public-domain geometry: https://www.naturalearthdata.com/about/terms-of-use/ ; original https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson . Reduced to rounded coordinate rings. Boundaries reflect the source's de facto mapping and are not a political endorsement.
- OpenSky restriction checked: https://opensky-network.org/about/terms-of-use . CelesTrak usage policy: https://celestrak.org/usage-policy.php .

## Verification

`node tests/test_model.mjs`: freshness, units, coordinates, malformed data, sphere/rotation invariants, command allowlist.

Local and live UI review checks actual-source loading separately from deterministic intercepted outage tests. Voice recognition must be checked on a browser/device supporting it; mocked recognition proves routing/error handling only, not actual audio transcription. No microphone recording is stored by this application.
