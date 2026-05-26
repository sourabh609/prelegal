"use client";

import ReactMarkdown from "react-markdown";
import { NdaFormData } from "@/lib/types";

interface Props {
  markdown: string;
  formData: NdaFormData;
}

function PartyTable({ formData }: { formData: NdaFormData }) {
  const rows = [
    { label: "Print Name", p1: formData.party1Name, p2: formData.party2Name },
    { label: "Title", p1: formData.party1Title, p2: formData.party2Title },
    { label: "Company", p1: formData.party1Company, p2: formData.party2Company },
    { label: "Notice Address", p1: formData.party1Address, p2: formData.party2Address },
    { label: "Signature", p1: "", p2: "" },
    { label: "Date", p1: "", p2: "" },
  ];

  return (
    <table className="w-full border-collapse text-sm my-4">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-medium w-1/3" />
          <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-center font-medium w-1/3">
            PARTY 1
          </th>
          <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-center font-medium w-1/3">
            PARTY 2
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ label, p1, p2 }) => (
          <tr key={label}>
            <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 bg-gray-50">
              {label}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-center">
              {p1 || <span className="text-gray-300">—</span>}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-center">
              {p2 || <span className="text-gray-300">—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function NdaPreview({ markdown, formData }: Props) {
  const parts = markdown.split("<!-- PARTY_TABLE -->");

  return (
    <div className="prose prose-sm max-w-none text-gray-800">
      {parts.map((part, i) => (
        <span key={i}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-gray-900 mt-5 mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-gray-800 mt-4 mb-1">{children}</h3>
              ),
              hr: () => <hr className="my-6 border-gray-300" />,
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed">{children}</p>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 mb-3 space-y-2">{children}</ol>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
              ),
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {children}
                </a>
              ),
            }}
          >
            {part}
          </ReactMarkdown>
          {i < parts.length - 1 && <PartyTable formData={formData} />}
        </span>
      ))}
    </div>
  );
}
