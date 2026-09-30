import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-brand-navy p-12">
      <div className="mx-auto grid w-full max-w-275 grid-cols-6 gap-10 border-b border-b-line pb-10">
        <div className="col-span-2">
          <Image
            src="/logo-light.png"
            alt="invoice-guard"
            width={100}
            height={40}
            className="mb-3.5 block"
          />
          <p className="mb-5 max-w-52 text-xs text-content-subtle">
            Payment intelligence for UK businesses. Know who you are dealing with before you quote,
            sign, invoice, or start work.
          </p>
          <div className="flex gap-2">
            <a
              href="#"
              className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface-subtle/70 text-sm text-content-muted transition-all hover:bg-content-subtle hover:text-content-inverse"
              title="LinkedIn"
            >
              in
            </a>
            <a
              href="#"
              className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface-subtle/70 text-sm text-content-muted transition-all hover:bg-content-subtle hover:text-content-inverse"
              title="X"
            >
              𝕏
            </a>
            <a
              href="#"
              className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface-subtle/70 text-sm text-content-muted transition-all hover:bg-content-subtle hover:text-content-inverse"
              title="Facebook"
            >
              f
            </a>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <a
              className="text-xs text-nowrap text-content-subtle transition-colors duration-150 hover:text-surface-subtle"
              href="mailto:hello@invoiceguard.co.uk"
            >
              ✉ hello@invoiceguard.co.uk
            </a>
          </div>
        </div>
        <div>
          <p className="ft-title">Product</p>
          <div className="link-container">
            <a href="#" className="ft-link">
              How it works
            </a>
            <a href="#" className="ft-link">
              What we check
            </a>
            <a href="#" className="ft-link">
              Sample report
            </a>
            <a href="#pricing" className="ft-link">
              Pricing
            </a>
            <a href="#" className="ft-link">
              Organisation pricing
            </a>
          </div>
        </div>
        <div>
          <p className="ft-title">Data sources</p>
          <div className="link-container">
            <a
              href="https://find-and-update.company-information.service.gov.uk"
              target="_blank"
              rel="noreferrer"
              className="ft-link"
            >
              Companies House
            </a>
            <a
              href="https://www.registry-trust.org.uk"
              target="_blank"
              rel="noreferrer"
              className="ft-link"
            >
              Registry Trust
            </a>
            <a
              href="https://www.smallbusinesscommissioner.gov.uk"
              target="_blank"
              rel="noreferrer"
              className="ft-link"
            >
              Small Business Commissioner
            </a>
          </div>
        </div>
        <div>
          <p className="ft-title">Company</p>
          <div className="link-container">
            <a href="#" className="ft-link">
              About us
            </a>
            <a href="#" className="ft-link">
              Blog
            </a>
            <a href="#" className="ft-link">
              Contact
            </a>
            <a href="#" className="ft-link">
              Careers
            </a>
          </div>
        </div>
        <div>
          <p className="ft-title">Legal</p>
          <div className="link-container">
            <a href="#" className="ft-link">
              Privacy Policy
            </a>
            <a href="#" className="ft-link">
              Terms of Service
            </a>
            <a href="#" className="ft-link">
              Cookie Policy
            </a>
            <a href="#" className="ft-link">
              Disclaimer
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-275 flex-wrap justify-between gap-3.5 px-8 py-5">
        <div>
          <p className="text-xs text-content-subtle">
            © 2026 InvoiceGuard Ltd. All rights reserved. Registered in England &amp; Wales.
          </p>
          <p className="mt-1 max-w-140 text-xs text-content-subtle">
            InvoiceGuard is a registered trading name. Company data sourced from official UK public
            registers. Reports are for informational purposes only and do not constitute legal or
            financial advice.
          </p>
        </div>
        <div className="flex gap-5">
          <a
            href="#"
            className="text-xs text-content-subtle transition-colors hover:text-content-inverse"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-xs text-content-subtle transition-colors hover:text-content-inverse"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs text-content-subtle transition-colors hover:text-content-inverse"
          >
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
}
