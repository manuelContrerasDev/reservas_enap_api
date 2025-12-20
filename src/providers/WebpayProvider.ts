/**
 * ============================================================
 *  Webpay Provider – REST v1.2 Oficial
 *  Versión estable: compatible con dev y prod
 * ============================================================
 */

// Endpoint oficial
const BASE_URL = "https://webpay3g.transbank.cl";

// ENV
const COMMERCE_CODE = process.env.WEBPAY_COMMERCE_CODE;
const API_KEY_SECRET = process.env.WEBPAY_API_KEY_SECRET;
const API_KEY_ID = process.env.WEBPAY_API_KEY_ID || COMMERCE_CODE;

const isProd = process.env.NODE_ENV === "production";

// ============================
// Validación de credenciales
// ============================
if (isProd) {
  if (!COMMERCE_CODE || !API_KEY_SECRET) {
    console.error("❌ ERROR: Faltan credenciales Webpay en .env (PRODUCCIÓN)");
    throw new Error("Variables Webpay incompletas (WebpayProvider)");
  }
} else {
  console.log("⚠️ Webpay desactivado en modo desarrollo");
}

// ============================
// Tipos Webpay
// ============================
export interface WebpayInitResponse {
  token: string;
  url: string;
}

export interface WebpayConfirmResponse {
  status?: string;
  response_code?: number;
  amount?: number;
  buy_order?: string;
  session_id?: string;
  accounting_date?: string;
  transaction_date?: string;
  payment_type_code?: string;
  installments_number?: number;
}

// ============================
// Clase principal
// ============================
export class WebpayProvider {
  /** Crear transacción */
  static async crearTransaccion(params: {
    buyOrder: string;
    sessionId: string;
    amount: number;
    returnUrl: string;
    finalUrl?: string;
  }): Promise<WebpayInitResponse> {

    if (!isProd) {
      console.log("⚠️ Webpay.init ignorado en desarrollo");
      return {
        token: "dev-token",
        url: process.env.WEB_URL + "/pago/dev-ok"
      };
    }

    const body = {
      buy_order: params.buyOrder,
      session_id: params.sessionId,
      amount: params.amount,
      return_url: params.returnUrl,
      ...(params.finalUrl ? { final_url: params.finalUrl } : {}),
    };

    const resp = await fetch(
      `${BASE_URL}/rswebpaytransaction/api/webpay/v1.2/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Tbk-Api-Key-Id": API_KEY_ID!,
          "Tbk-Api-Key-Secret": API_KEY_SECRET!,
        },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("❌ Webpay Init Error:", txt);
      throw new Error(`WebpayInitError: ${resp.status}`);
    }

    return (await resp.json()) as WebpayInitResponse;
  }

  /** Confirmar transacción */
  static async confirmar(token: string): Promise<WebpayConfirmResponse> {
    if (!isProd) {
      console.log("⚠️ Webpay.confirm ignorado en desarrollo");
      return { status: "AUTHORIZED", response_code: 0 };
    }

    const resp = await fetch(
      `${BASE_URL}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Tbk-Api-Key-Id": API_KEY_ID!,
          "Tbk-Api-Key-Secret": API_KEY_SECRET!,
        },
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("❌ Webpay Confirm Error:", txt);
      throw new Error(`WebpayConfirmError: ${resp.status}`);
    }

    return (await resp.json()) as WebpayConfirmResponse;
  }
}
