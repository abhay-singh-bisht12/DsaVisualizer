"use client";

import { AlgorithmCard } from "@/components/algorithm-card";
import {
  GitCompare,
  Split,
  Calculator,
  Search,
  ListChecks,
  ArrowDownAZ,
  ArrowUpAZ,
  Shuffle,
  Layers,
  Hash,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Home } from "lucide-react";

const algorithms = [
  {
    title: "Bubble Sort",
    description:
      "A simple comparison-based sorting algorithm where the largest elements \"bubble\" to the end of the array.",
    icon: GitCompare,
    href: "/algorithms/bubble-sort",
    complexity: "O(n²)",
    category: "Sorting",
  },
  {
    title: "Merge Sort",
    description:
      "A divide-and-conquer sorting algorithm that splits the array and merges sorted halves.",
    icon: Split,
    href: "/algorithms/merge-sort",
    complexity: "O(n log n)",
    category: "Sorting",
  },
  {
    title: "Quick Sort",
    description:
      "An efficient divide-and-conquer sorting algorithm that partitions around a pivot.",
    icon: Shuffle,
    href: "/algorithms/quick-sort",
    complexity: "O(n log n)",
    category: "Sorting",
  },
  {
    title: "Insertion Sort",
    description:
      "Builds a sorted array one element at a time by inserting each element into its correct position.",
    icon: ArrowDownAZ,
    href: "/algorithms/insertion-sort",
    complexity: "O(n²)",
    category: "Sorting",
  },
  {
    title: "Selection Sort",
    description:
      "Selects the smallest element from the unsorted portion and swaps it into the correct place.",
    icon: ArrowUpAZ,
    href: "/algorithms/selection-sort",
    complexity: "O(n²)",
    category: "Sorting",
  },
  {
    title: "Heap Sort",
    description:
      "Uses a max heap to repeatedly extract the largest element and place it at the end.",
    icon: Layers,
    href: "/algorithms/heap-sort",
    complexity: "O(n log n)",
    category: "Sorting",
  },
  {
    title: "Binary Search",
    description:
      "Efficiently searches for a value in a sorted array by repeatedly halving the search range.",
    icon: Search,
    href: "/algorithms/binary-search",
    complexity: "O(log n)",
    category: "Searching",
  },
  {
    title: "Linear Search",
    description:
      "Sequentially scans each element to find a target value in an array.",
    icon: ListChecks,
    href: "/algorithms/linear-search",
    complexity: "O(n)",
    category: "Searching",
  },
  {
    title: "Two Sum (Hash Map)",
    description:
      "Find two indices such that their values add up to a target using a hash map.",
    icon: Hash,
    href: "/algorithms/two-sum",
    complexity: "O(n)",
    category: "Hashing",
  },
  {
    title: "Kadane's Algorithm",
    description:
      "Dynamic programming technique to find the maximum sum contiguous subarray.",
    icon: Calculator,
    href: "/algorithms/kadane",
    complexity: "O(n)",
    category: "Dynamic Programming",
  },
];

export default function AlgorithmsIndexPage() {
  const categories = Array.from(new Set(algorithms.map((algo) => algo.category)));

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 mb-2">
              Algorithms Library
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Explore interactive visualizations for searching and sorting
              algorithms, plus classic dynamic programming techniques.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        <div className="flex justify-center gap-4 flex-wrap mb-10">
          {categories.map((category) => (
            <Card key={category} className="px-4 py-2 bg-secondary/50">
              <span className="text-primary font-semibold">{category}</span>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {algorithms.map((algorithm) => (
            <AlgorithmCard key={algorithm.title} {...algorithm} />
          ))}
        </div>
      </div>
    </main>
  );
}

