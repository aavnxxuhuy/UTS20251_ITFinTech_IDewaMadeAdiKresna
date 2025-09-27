declare module "xendit" {
  export interface XenditOptions {
    secretKey: string;
  }

  export interface InvoiceParams {
    externalID: string;
    payerEmail: string;
    description?: string;
    amount: number;
    successRedirectURL?: string;
    failureRedirectURL?: string;
  }

  export interface InvoiceInstance {
    createInvoice(params: InvoiceParams): Promise<{ id: string; invoice_url: string }>;
  }

  export class Xendit {
    constructor(options: XenditOptions);
    Invoice: { new (options?: any): InvoiceInstance };
  }

  const xendit: typeof Xendit;
  export default xendit;
}
