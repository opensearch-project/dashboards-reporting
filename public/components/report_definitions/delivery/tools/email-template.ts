/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
const logoWhite = `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`;

const emailIcon = `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`;

export const emailTemplate = `<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap');
</style>
<table role="presentation" border="0" cellpadding="0" cellspacing="0"
    width="100%" style="margin-top: 20px;">
    <tr>
        <td align="center">
            <!-- Main container -->
            <table role="presentation" border="0" cellpadding="0"
                cellspacing="0"
                width="100%" class="body">
                <tr>
                    <td align="center">
                        <!-- Card (2/3 width) -->
                        <table role="presentation" border="0" cellpadding="0"
                            cellspacing="0" width="66.6%" class="main-content"
                            style="max-width: 700px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">

                            <!-- Blue banner -->
                            <tr>
                                <td align="center" bgcolor="#3D82F1"
                                    style="padding: 40px 0; border-radius: 30px;">
                                    <img src="data:image/jpg;base64,${logoWhite}"
                                        alt="Wazuh logo"
                                        style="max-width: 160px; height: auto; display: block;">
                                </td>
                            </tr>

                            <!-- Report icon -->
                            <tr>
                                <td align="center"
                                    style="padding: 40px 0 20px;">
                                    <img src="data:image/jpg;base64,${emailIcon}"
                                        alt="Report Icon"
                                        style="max-width: 120px; height: auto; display: block;">
                                </td>
                            </tr>

                            <!-- Title -->
                            <tr>
                                <td align="center" style="padding: 0 40px;">
                                    <h2
                                        style="font-size: 26px; font-weight: 200; margin: 0; color: #000000; font-family: Manrope, 'Segoe UI', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;">New
                                        Report <span
                                            style="font-weight: 800;">Available</span></h2>
                                </td>
                            </tr>

                            <!-- Main text -->
                            <tr>
                                <td align="center"
                                    style="padding: 20px 30px 0;">
                                    <p
                                        style="font-size: 14px; font-weight: 400; color: #000000; line-height: 2.2; margin: 0; font-family: 'Manrope', 'Segoe UI', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                                        A new report has been generated and is
                                        now available for
                                        review in your Wazuh platform.<br />
                                        You can access your report by clicking
                                        the button below
                                        or using the provided link.
                                    </p>
                                </td>
                            </tr>

                            <!-- Gradient button -->
                            <tr>
                                <td align="center"
                                    style="padding: 30px 0 40px;">
                                    <table border="0" cellpadding="0"
                                        cellspacing="0"
                                        role="presentation">
                                        <tr>
                                            <td align="center" bgcolor="#FEDD0B"
                                                style="border-radius: 8px; background: linear-gradient(90deg, #FEDD0B 0%, #F6B71B 100%);">
                                                <a href="{{reportLink}}"
                                                    target="_blank"
                                                    style="display: inline-block; padding: 14px 60px; font-size: 14px;; font-weight: 400; color: #000000; text-decoration: none; border-radius: 8px; font-family: Manrope, 'Segoe UI', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                                                    View Report
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <hr
                                        style="border: none; border-top: 1px solid #cccccc; margin: 0;">
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="justified"
                                    style="padding: 0 30px 30px;">
                                    <p
                                        style="font-size: 12px; color: #8690A0; font-family: Manrope, 'Segoe UI', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4; margin-bottom: 0; padding-bottom: 0; margin-top: 20px">
                                        Is the
                                        'Open in Wazuh Dashboards Reports'
                                        button not
                                        working? Copy and paste this link into your
                                        browser:
                                        {{reportLink}}</p><p style="font-size: 12px; color: #8690A0; font-family: Manrope, 'Segoe UI', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4; margin-top: 7px;">
                                        No longer want to receive this report?
                                        Please contact
                                        the report sender or the administrator
                                        of your Wazuh.
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`;
