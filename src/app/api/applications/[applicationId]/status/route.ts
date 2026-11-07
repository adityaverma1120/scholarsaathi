import { NextRequest, NextResponse } from 'next/server';
import {
  UpdateApplicationStatusRequestSchema,
  APPLICATION_STATUS_CATEGORIES,
  type ApplicationStatusCategory,
  type ActionActor,
} from '@/lib/tracker/schema';

function getStatusDetails(status: ApplicationStatusCategory): {
  labelEn: string;
  labelHi: string;
  whoActs: ActionActor;
  nextActionEn: string;
  nextActionHi: string;
} {
  switch (status) {
    case 'drafting':
      return {
        labelEn: 'Application In Draft',
        labelHi: 'आवेदन प्रारूप तैयार हो रहा है',
        whoActs: 'STUDENT',
        nextActionEn: 'Complete all mandatory sections and upload required documents before portal deadline.',
        nextActionHi: 'पोर्टल की अंतिम तिथि से पूर्व सभी आवश्यक प्रभाग भरें तथा दस्तावेज़ अपलोड करें।',
      };
    case 'ready_to_apply':
      return {
        labelEn: 'Ready for Portal Submission',
        labelHi: 'पोर्टल पर जमा करने हेतु तैयार',
        whoActs: 'STUDENT',
        nextActionEn: 'Log in to official portal and submit the application with final review.',
        nextActionHi: 'आधिकारिक पोर्टल पर लॉगिन कर अंतिम समीक्षा के उपरांत आवेदन जमा करें।',
      };
    case 'submitted_pending_institute':
      return {
        labelEn: 'Submitted — Pending Institute Verification',
        labelHi: 'जमा किया गया — संस्थान सत्यापन हेतु लंबित',
        whoActs: 'INSTITUTE',
        nextActionEn: 'Submit printed form and document copies to your College Nodal Officer.',
        nextActionHi: 'कॉलेज नोडल अधिकारी के पास आवेदन की हार्ड कॉपी और दस्तावेज़ जमा करें।',
      };
    case 'pending_district_state':
      return {
        labelEn: 'Pending District / State Officer Verification',
        labelHi: 'ज़िला / राज्य स्तरीय अधिकारी सत्यापन हेतु लंबित',
        whoActs: 'DISTRICT_STATE',
        nextActionEn: 'Await verification by District Social Welfare Officer (DSWO) or State Nodal Officer.',
        nextActionHi: 'ज़िला समाज कल्याण अधिकारी (DSWO) या राज्य नोडल अधिकारी के सत्यापन की प्रतीक्षा करें।',
      };
    case 'defective_correction_needed':
      return {
        labelEn: 'Defective — Correction Required',
        labelHi: 'दोषपूर्ण — संशोधन आवश्यक',
        whoActs: 'STUDENT',
        nextActionEn: 'Log in to the official portal immediately, correct defective fields, and re-submit within the window.',
        nextActionHi: 'तत्काल पोर्टल पर लॉगिन करें, त्रुटिपूर्ण विवरण संशोधित करें, और निर्धारित अवधि में पुनः जमा करें।',
      };
    case 'rejected':
      return {
        labelEn: 'Application Rejected',
        labelHi: 'आवेदन निरस्त / अस्वीकृत',
        whoActs: 'STUDENT',
        nextActionEn: 'Check specific rejection reason, consult college nodal desk, or lodge an official grievance.',
        nextActionHi: 'अस्वीकृति के विशिष्ट कारण की जाँच करें, कॉलेज नोडल डेस्क से संपर्क करें, या आधिकारिक शिकायत दर्ज करें।',
      };
    case 'sanctioned_payment_pending':
      return {
        labelEn: 'Scholarship Sanctioned — Payment Pending',
        labelHi: 'छात्रवृत्ति स्वीकृत — भुगतान लंबित',
        whoActs: 'BANK',
        nextActionEn: 'Ensure your bank account is active and seeded with Aadhaar for DBT transfer.',
        nextActionHi: 'सुनिश्चित करें कि आपका बैंक खाता सक्रिय है और डीबीटी भुगतान हेतु आधार से जुड़ा हुआ है।',
      };
    case 'payment_disbursed':
      return {
        labelEn: 'Scholarship Disbursed / Paid',
        labelHi: 'छात्रवृत्ति राशि अंतरित / भुगतान पूर्ण',
        whoActs: 'PORTAL',
        nextActionEn: 'Check your bank account passbook or PFMS portal for credited installment.',
        nextActionHi: 'अपने बैंक खाते की पासबुक या PFMS पोर्टल पर अंतरित राशि की पुष्टि करें।',
      };
    case 'unknown':
    default:
      return {
        labelEn: 'Status Unrecognised / Unknown',
        labelHi: 'अज्ञात / अपरिचित स्थिति',
        whoActs: 'PORTAL',
        nextActionEn: 'Consult college nodal desk or check the exact wording on the official portal.',
        nextActionHi: 'कॉलेज नोडल डेस्क से संपर्क करें या आधिकारिक पोर्टल पर स्थिति की जांच करें।',
      };
  }
}

/**
 * PATCH /api/applications/[applicationId]/status
 * Validates status update payload and returns updated metadata.
 * Note: Storage persists on client IndexedDB; API verifies integrity and format.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    if (!applicationId || applicationId.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'Application ID is required.',
          },
        },
        { status: 400 }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > 4096) {
      return NextResponse.json(
        {
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request payload exceeds 4 KB maximum limit.',
          },
        },
        { status: 413 }
      );
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Request body must be valid JSON.',
          },
        },
        { status: 400 }
      );
    }

    const parseResult = UpdateApplicationStatusRequestSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status update request failed validation.',
            details,
          },
        },
        { status: 400 }
      );
    }

    const { status, rawRemark, inputMethod, notes } = parseResult.data;
    const details = getStatusDetails(status);

    const now = new Date().toISOString();
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status,
      statusLabelEn: details.labelEn,
      statusLabelHi: details.labelHi,
      recordedAt: now,
      rawRemark,
      whoActs: details.whoActs,
      notes,
      inputMethod,
    };

    return NextResponse.json(
      {
        data: {
          applicationId,
          newStatus: status,
          statusLabelEn: details.labelEn,
          statusLabelHi: details.labelHi,
          whoActs: details.whoActs,
          nextActionEn: details.nextActionEn,
          nextActionHi: details.nextActionHi,
          timelineEvent: event,
          updatedAt: now,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Application Status Update API] Error:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating application status.',
        },
      },
      { status: 500 }
    );
  }
}

