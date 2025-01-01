'use client';

import { useSummary } from "@/app/vemo/[vemo]/context/SummaryContext";


export default function SummaryView() {
    const { summaryData } = useSummary();

    if (!summaryData) {
        return <div>요약 데이터가 없습니다.</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">AI 요약</h2>
            <div className="space-y-4">
                {summaryData.summaryList.map(item => (
                    <div key={item.id} className="border p-3 rounded-lg">
                        <div className="font-semibold text-blue-600">{item.timestamp}</div>
                        <p className="mt-1">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
