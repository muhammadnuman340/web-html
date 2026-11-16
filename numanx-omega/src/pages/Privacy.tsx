import LegalPage from './LegalPage'

/**
 * Privacy Policy Page
 *
 * Discloses data handling practices:
 * - 100% client-side unit conversion calculations.
 * - Zero tracking, zero analytics cookies, zero advertising cookies.
 * - Feedback intake: When users submit "Report a problem / Suggest an improvement",
 *   the submission (type, message, page URL, and optional email) is forwarded
 *   securely to our Google Apps Script intake sheet.
 * - Nothing leaves your browser unless you send feedback.
 */
export default function Privacy() {
  return <LegalPage doc="privacy" />
}
