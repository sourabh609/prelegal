"use client";

import { NdaFormData } from "@/lib/types";

interface Props {
  data: NdaFormData;
  onChange: (data: NdaFormData) => void;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {hint && <span className="ml-1 text-xs text-gray-400">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function NdaForm({ data, onChange }: Props) {
  function set<K extends keyof NdaFormData>(key: K, value: NdaFormData[K]) {
    onChange({ ...data, [key]: value });
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      {/* Agreement Terms */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900 border-b pb-2">
          Agreement Terms
        </h2>

        <Field label="Purpose" hint="How Confidential Information may be used">
          <textarea
            rows={2}
            className={inputCls}
            value={data.purpose}
            onChange={(e) => set("purpose", e.target.value)}
            placeholder="Evaluating whether to enter into a business relationship…"
          />
        </Field>

        <Field label="Effective Date">
          <input
            type="date"
            className={inputCls}
            value={data.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
          />
        </Field>

        <Field label="MNDA Term" hint="The length of this MNDA">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="mndaTermType"
                checked={data.mndaTermType === "expires"}
                onChange={() => set("mndaTermType", "expires")}
              />
              Expires after
              <input
                type="number"
                min="1"
                className={`${inputCls} w-20`}
                value={data.mndaTermYears}
                disabled={data.mndaTermType !== "expires"}
                onChange={(e) => set("mndaTermYears", e.target.value)}
              />
              year(s) from Effective Date
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="mndaTermType"
                checked={data.mndaTermType === "until_terminated"}
                onChange={() => set("mndaTermType", "until_terminated")}
              />
              Continues until terminated
            </label>
          </div>
        </Field>

        <Field
          label="Term of Confidentiality"
          hint="How long Confidential Information is protected"
        >
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="confidentialityTermType"
                checked={data.confidentialityTermType === "expires"}
                onChange={() => set("confidentialityTermType", "expires")}
              />
              <input
                type="number"
                min="1"
                className={`${inputCls} w-20`}
                value={data.confidentialityTermYears}
                disabled={data.confidentialityTermType !== "expires"}
                onChange={(e) =>
                  set("confidentialityTermYears", e.target.value)
                }
              />
              year(s) from Effective Date
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="confidentialityTermType"
                checked={data.confidentialityTermType === "perpetuity"}
                onChange={() => set("confidentialityTermType", "perpetuity")}
              />
              In perpetuity
            </label>
          </div>
        </Field>

        <Field label="Governing Law" hint="State">
          <input
            type="text"
            className={inputCls}
            value={data.governingLaw}
            onChange={(e) => set("governingLaw", e.target.value)}
            placeholder="e.g. Delaware"
          />
        </Field>

        <Field label="Jurisdiction" hint="City or county and state">
          <input
            type="text"
            className={inputCls}
            value={data.jurisdiction}
            onChange={(e) => set("jurisdiction", e.target.value)}
            placeholder="e.g. courts located in New Castle, DE"
          />
        </Field>

        <Field label="MNDA Modifications" hint="optional">
          <textarea
            rows={2}
            className={inputCls}
            value={data.modifications}
            onChange={(e) => set("modifications", e.target.value)}
            placeholder="List any modifications to the standard terms…"
          />
        </Field>
      </section>

      {/* Party 1 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900 border-b pb-2">
          Party 1
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <input
              type="text"
              className={inputCls}
              value={data.party1Name}
              onChange={(e) => set("party1Name", e.target.value)}
              placeholder="Jane Smith"
            />
          </Field>
          <Field label="Title">
            <input
              type="text"
              className={inputCls}
              value={data.party1Title}
              onChange={(e) => set("party1Title", e.target.value)}
              placeholder="CEO"
            />
          </Field>
          <Field label="Company">
            <input
              type="text"
              className={inputCls}
              value={data.party1Company}
              onChange={(e) => set("party1Company", e.target.value)}
              placeholder="Acme Inc."
            />
          </Field>
          <Field label="Notice Address" hint="email or postal">
            <input
              type="text"
              className={inputCls}
              value={data.party1Address}
              onChange={(e) => set("party1Address", e.target.value)}
              placeholder="jane@acme.com"
            />
          </Field>
        </div>
      </section>

      {/* Party 2 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900 border-b pb-2">
          Party 2
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <input
              type="text"
              className={inputCls}
              value={data.party2Name}
              onChange={(e) => set("party2Name", e.target.value)}
              placeholder="John Doe"
            />
          </Field>
          <Field label="Title">
            <input
              type="text"
              className={inputCls}
              value={data.party2Title}
              onChange={(e) => set("party2Title", e.target.value)}
              placeholder="CTO"
            />
          </Field>
          <Field label="Company">
            <input
              type="text"
              className={inputCls}
              value={data.party2Company}
              onChange={(e) => set("party2Company", e.target.value)}
              placeholder="Globex Corp."
            />
          </Field>
          <Field label="Notice Address" hint="email or postal">
            <input
              type="text"
              className={inputCls}
              value={data.party2Address}
              onChange={(e) => set("party2Address", e.target.value)}
              placeholder="john@globex.com"
            />
          </Field>
        </div>
      </section>
    </form>
  );
}
