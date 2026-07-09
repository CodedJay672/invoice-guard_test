import { formatAddress, formatDateWithAge } from '@/components/company-search/CompanySearchExperience';
import { requestFreePreview } from '@/lib/data/free-company-prev';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import React from 'react'

async function CompanyDetails({ params }: { params: Promise<{ houseNumber: string }> }) {
  const { houseNumber } = await params;
  if (!houseNumber) {
    return (
      <Alert>
        <AlertTitle>Invalid Company Number</AlertTitle>
        <AlertDescription>Please provide a valid company number.</AlertDescription>
      </Alert>
    )
  }


  const companyProfile = await requestFreePreview(houseNumber);

  return (
    <>
      {companyProfile.status === 'success' ? (
        <section className='w-full bg-page'>
          <div className='bg-surface border-b border-line py-5 px-7'>
            <div className="w-full max-w-240 mx-auto flex justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold text-content-subtle uppercase mb-px">Company Name</p>
                <h1 className="text-xl font-extrabold mb-1.5">{companyProfile.preview.company.companyName}</h1>
                <p className="text-xs text-content-muted mb-px">{companyProfile.preview.company.companyType?.toUpperCase()} - Incoporated in {formatDateWithAge(companyProfile.preview.company.incorporationDate, companyProfile.preview.companyAge)}</p>
                <p className="text-xs text-content-subtle">
                  {companyProfile.preview.company.registeredOfficeAddress.addressLine1},
                  {companyProfile.preview.company.registeredOfficeAddress.region}, {companyProfile.preview.company.registeredOfficeAddress.country}, {companyProfile.preview.company.registeredOfficeAddress.postalCode}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={companyProfile.preview.company.companyStatus === "active" ? "positive" : "critical"} className={cn("rounded-sm py-1.5 px-4 text-xs font-extrabold")}>{companyProfile.preview.company.companyStatus}</Badge>
                {companyProfile.preview.company.cessationDate && (
                  <span>
                    {formatDateWithAge(companyProfile.preview.company.cessationDate, undefined)}
                  </span>
                )}


                <div className="flex gap-1.5 flex-wrap justify-end">
                  <span className="overdue-badge">{companyProfile.preview.company.accounts?.next_due}</span>
                  <span className="overdue-badge">{companyProfile.preview.company.accounts?.next_made_up_to}</span>
                </div>


                <span className="text-xs text-content-subtle">SIC: {companyProfile.preview.company.sicCodes} - {companyProfile.preview.company.industryLabel}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border-b border-line sticky top-12.5 z-50">
            <div className="max-w-240 mx-auto flex overflow-x-auto scrollbar-none">
              <Link href="overview" className="nav-tab">Overview</Link>
              <Link href="ai-summary" className="nav-tab" >AI Summary</Link>
              <Link href="charges" className="nav-tab" >
                Charges
              </Link>
              <Link href="insolvency" className="nav-tab" >Insolvency</Link>
              <Link href="officers" className="nav-tab" >Officers</Link>
              <Link href="filing-history" className="nav-tab" >Filing History</Link>
              <Link href="ccj" className="nav-tab" >
                CCJs
              </Link>
              <Link href="fpc" className="nav-tab" >
                Fair Payment Code
              </Link>
            </div>
          </div>

          <div className='max-w-240 mx-auto pt-7 pr-7 pb-14'>
            <div id="section-overview" className="flex flex-col gap-1.5">
              <div className="flex justify-between mb-4">
                <div>
                  <h2 className="text-lg font-extrabold mb-0.5">Company Overview</h2>
                  <p className="text-xs text-content-subtle">Public record from Companies House</p>
                </div>
              </div>

              <div className="cards-grid">
                <div className="info-card">
                  <p className="info-card-label">Company Number</p>
                  <p className="info-card-value">{companyProfile.preview.company.companiesHouseNumber}</p>
                </div>
                <div className="info-card">
                  <p className="info-card-label">Company Status</p>
                  <p className={cn("info-card-value", companyProfile.preview.company.companyStatus === "active" ? "text-positive-content" : "text-critical-content")}>{companyProfile.preview.company.companyStatus}</p>
                </div>
                <div className="info-card">
                  <p className="info-card-label">Company Type</p>
                  <p className="info-card-value">{companyProfile.preview.company.companyType?.toUpperCase()}</p>
                </div>
                <div className="info-card">
                  <p className="info-card-label">Incorporated</p>
                  <p className="info-card-value">{formatDateWithAge(companyProfile.preview.company.incorporationDate, undefined)}</p>
                </div>
                <div className="info-card">
                  <p className="info-card-label">SIC Code</p>
                  <p className="info-card-value">{companyProfile.preview.company.sicCodes} - {companyProfile.preview.company.industryLabel ?? 'N/A'}</p>
                </div>
                <div className="info-card">
                  <p className="info-card-label">Registered Address</p>
                  <p className="info-card-value" >{formatAddress(companyProfile.preview.company.registeredOfficeAddress)}</p>
                </div>
              </div>

              <div className="flex gap-2.5 flex-wrap my-6">
                <div className="rounded-sm px-3.5 py-1 border text-xs font-medium bg-caution-surface text-caution border-caution">
                  ⚠ <strong>Accounts overdue</strong> — period to {formatDateWithAge(companyProfile.preview.company.accounts?.next_made_up_to, undefined)} was due by {formatDateWithAge(companyProfile.preview.company.accounts?.next_due, undefined)}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <Alert variant="caution" className="mt-4">
          <AlertTitle>{companyProfile.status}</AlertTitle>
          <AlertDescription>{companyProfile.message}</AlertDescription>
        </Alert>
      )}
    </>
  )
}

export default CompanyDetails
