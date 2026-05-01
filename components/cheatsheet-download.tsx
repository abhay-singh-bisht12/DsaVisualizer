"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type CheatSheetDownloadProps = {
  fileName: string;
  title: string;
  definition: string;
  steps: string[];
};

export function CheatSheetDownload({
  fileName,
  title,
  definition,
  steps,
}: CheatSheetDownloadProps) {
  const handleDownload = () => {
    const contentLines = [
      `Algorithm: ${title}`,
      "",
      "Definition:",
      definition,
      "",
      "Step-by-step working:",
      ...steps.map((step, index) => `${index + 1}. ${step}`),
      "",
    ];

    const blob = new Blob([contentLines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="h-4 w-4 mr-1" />
      Download Cheat Sheet
    </Button>
  );
}

