import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-brand-navy p-12">
      <div className="w-full max-w-275 mx-auto grid grid-cols-6 gap-10 pb-10 border-b border-b-line">
        <div className="col-span-2">
          <Image src="/logo-light.png" alt="invoice-guard" width={100} height={40} className="block mb-3.5" />
          <p className="text-xs text-content-subtle max-w-52 mb-5">Payment intelligence for UK businesses. Know who you are dealing with before you quote, sign, invoice, or start work.</p>
          <div className="flex gap-2">
            <a href="#" className="size-8  rounded-lg bg-surface-subtle/70 border border-line flex items-center justify-center text-sm text-content-muted transition-all hover:bg-content-subtle hover:text-content-inverse" title="LinkedIn">in</a>
            <a href="#" className="size-8  rounded-lg bg-surface-subtle/70 border border-line flex items-center justify-center text-sm text-content-muted transition-all hover:bg-content-subtle hover:text-content-inverse" title="X">𝕏</a>
            <a href="#" className="size-8  rounded-lg bg-surface-subtle/70 border border-line flex items-center justify-center text-sm text-content-muted transition-all hover:bg-content-subtle hover:text-content-inverse" title="Facebook">f</a>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <a className="text-xs text-nowrap text-content-subtle transition-colors duration-150 hover:text-surface-subtle" href="mailto:hello@invoiceguard.co.uk">✉ hello@invoiceguard.co.uk</a>
          </div>
        </div>
        <div>
          <p className="ft-title">Product</p>
          <div className="link-container">
            <a href="#" className="ft-link">How it works</a>
            <a href="#" className="ft-link">What we check</a>
            <a href="#" className="ft-link">Sample report</a>
            <a href="#pricing" className="ft-link">Pricing</a>
            <a href="#" className="ft-link">Organisation pricing</a>
          </div>
        </div>
        <div>
          <p className="ft-title">Data sources</p>
          <div className="link-container">
            <a href="https://find-and-update.company-information.service.gov.uk" target="_blank" rel="noreferrer" className="ft-link">Companies House</a>
            <a href="https://www.registry-trust.org.uk" target="_blank" rel="noreferrer" className="ft-link">Registry Trust</a>
            <a href="https://www.smallbusinesscommissioner.gov.uk" target="_blank" rel="noreferrer" className="ft-link">Small Business Commissioner</a>
          </div>
        </div>
        <div>
          <p className="ft-title">Company</p>
          <div className="link-container">
            <a href="#" className="ft-link">About us</a>
            <a href="#" className="ft-link">Blog</a>
            <a href="#" className="ft-link">Contact</a>
            <a href="#" className="ft-link">Careers</a>
          </div>
        </div>
        <div>
          <p className="ft-title">Legal</p>
          <div className="link-container">
            <a href="#" className="ft-link">Privacy Policy</a>
            <a href="#" className="ft-link">Terms of Service</a>
            <a href="#" className="ft-link">Cookie Policy</a>
            <a href="#" className="ft-link">Disclaimer</a>
          </div>
        </div>
      </div>
      <div className="max-w-275 mx-auto py-5 px-8 flex justify-between flex-wrap gap-3.5">
        <div>
          <p className="text-xs text-content-subtle">© 2026 InvoiceGuard Ltd. All rights reserved. Registered in England &amp; Wales.</p>
          <p className="text-xs text-content-subtle mt-1 max-w-140">InvoiceGuard is a registered trading name. Company data sourced from official UK public registers. Reports are for informational purposes only and do not constitute legal or financial advice.</p>
        </div>
        <div className="flex gap-5">
          <a href="#" className="text-xs text-content-subtle transition-colors hover:text-content-inverse">Privacy</a>
          <a href="#" className="text-xs text-content-subtle transition-colors hover:text-content-inverse">Terms</a>
          <a href="#" className="text-xs text-content-subtle transition-colors hover:text-content-inverse">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
