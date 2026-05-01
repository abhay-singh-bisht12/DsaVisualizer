"use client";

import { useState, useEffect } from 'react';
import { AlgorithmCard } from '@/components/algorithm-card';
import { GitCompare, Split, Calculator, Search, ListChecks, ArrowDownAZ, ArrowUpAZ, Shuffle, Layers, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const algorithms = [
    {
      title: 'Bubble Sort',
      description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
      icon: GitCompare,
      href: '/algorithms/bubble-sort',
      complexity: 'O(n²)',
      category: 'Sorting'
    },
    {
      title: 'Merge Sort',
      description: 'An efficient, stable sorting algorithm that uses divide and conquer strategy to sort elements by splitting, sorting, and merging subarrays.',
      icon: Split,
      href: '/algorithms/merge-sort',
      complexity: 'O(n log n)',
      category: 'Sorting'
    },
    {
      title: "Kadane's Algorithm",
      description: 'An efficient algorithm for finding the maximum subarray sum in a one-dimensional array, useful for optimization problems.',
      icon: Calculator,
      href: '/algorithms/kadane',
      complexity: 'O(n)',
      category: 'Dynamic Programming'
    },
    {
      title: 'Binary Search',
      description: 'A fast search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search space in half.',
      icon: Search,
      href: '/algorithms/binary-search',
      complexity: 'O(log n)',
      category: 'Searching'
    },
    {
      title: 'Linear Search',
      description: 'A simple searching algorithm that checks each element one by one until the target is found or the end of the array is reached.',
      icon: ListChecks,
      href: '/algorithms/linear-search',
      complexity: 'O(n)',
      category: 'Searching'
    },
    {
      title: 'Insertion Sort',
      description: 'A simple, stable sorting algorithm that builds the final sorted array one item at a time by inserting elements into a sorted portion.',
      icon: ArrowDownAZ,
      href: '/algorithms/insertion-sort',
      complexity: 'O(n²)',
      category: 'Sorting'
    },
    {
      title: 'Selection Sort',
      description: 'A sorting algorithm that repeatedly selects the smallest element from the unsorted part and moves it to the sorted part.',
      icon: ArrowUpAZ,
      href: '/algorithms/selection-sort',
      complexity: 'O(n²)',
      category: 'Sorting'
    },
    {
      title: 'Quick Sort',
      description: 'A fast divide-and-conquer sorting algorithm that partitions the array around a pivot and recursively sorts the partitions.',
      icon: Shuffle,
      href: '/algorithms/quick-sort',
      complexity: 'O(n log n)',
      category: 'Sorting'
    },
    {
      title: 'Heap Sort',
      description: 'A sorting algorithm that uses a max heap to repeatedly extract the largest element and place it at the end of the array.',
      icon: Layers,
      href: '/algorithms/heap-sort',
      complexity: 'O(n log n)',
      category: 'Sorting'
    },
    {
      title: 'Two Sum (Hash Map)',
      description: 'Find two indices such that their values add up to a target using a hash map in linear time on average.',
      icon: Hash,
      href: '/algorithms/two-sum',
      complexity: 'O(n)',
      category: 'Hashing'
    }
  ];

  const categories = Array.from(new Set(algorithms.map(algo => algo.category)));
  const visibleAlgorithms = activeCategory
    ? algorithms.filter((algo) => algo.category === activeCategory)
    : algorithms;

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 mb-4">
            DSA Visualizer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Interactive visualizations of common data structures and algorithms.
            Learn through animation and hands-on experimentation.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveCategory((prev) => (prev === category ? null : category))
                  }
                  className="focus:outline-none"
                >
                  <Card
                    className={
                      "px-4 py-2 cursor-pointer transition-colors border " +
                      (isActive
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-secondary/50 border-transparent text-primary")
                    }
                  >
                    <span className="font-semibold">
                      {category}
                      {isActive ? " · active" : ""}
                    </span>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {visibleAlgorithms.map((algorithm) => (
            <AlgorithmCard key={algorithm.title} {...algorithm} />
          ))}
        </div>
      </div>
    </main>
  );
}