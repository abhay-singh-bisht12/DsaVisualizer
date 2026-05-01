"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Home, Play, Pause, RefreshCw } from "lucide-react";
import { CheatSheetDownload } from "@/components/cheatsheet-download";

type Step = {
  array: number[];
  left: number;
  right: number;
  pivotIndex: number;
  i: number;
  j: number;
  phase: "partition" | "recurse";
  description: string;
};

export default function QuickSortPage() {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(10);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number[]>([50]);
  const [customInput, setCustomInput] = useState<string>("");
  const [comparisons, setComparisons] = useState<number>(0);
  const [swaps, setSwaps] = useState<number>(0);

  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateRandomArray();
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [arraySize]);

  const generateRandomArray = () => {
    const size = Math.min(Math.max(5, arraySize), 14);
    const newArray = Array.from(
      { length: size },
      () => Math.floor(Math.random() * 99) + 1
    );
    resetState(newArray);
  };

  const resetState = (arr = array) => {
    setArray(arr);
    setSteps([]);
    setCurrentStepIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setComparisons(0);
    setSwaps(0);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleCustomArray = () => {
    try {
      const numbers = customInput
        .split(",")
        .map((num) => parseInt(num.trim()))
        .filter((num) => !isNaN(num));

      if (numbers.length > 0) {
        resetState(numbers);
      }
    } catch (error) {
      console.error("Invalid input format");
    }
  };

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      animationRef.current = setTimeout(resolve, ms);
    });

  const collectQuickSortSteps = (arr: number[]) => {
    const localSteps: Step[] = [];
    const arrCopy = [...arr];

    const partition = (a: number[], low: number, high: number): number => {
      const pivot = a[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        localSteps.push({
          array: [...a],
          left: low,
          right: high,
          pivotIndex: high,
          i,
          j,
          phase: "partition",
          description: `Comparing element ${a[j]} at index ${j} with pivot ${pivot} at index ${high}.`,
        });

        if (a[j] <= pivot) {
          i++;
          [a[i], a[j]] = [a[j], a[i]];
          localSteps.push({
            array: [...a],
            left: low,
            right: high,
            pivotIndex: high,
            i,
            j,
            phase: "partition",
            description: `Swapped elements at indices ${i} and ${j} because ${a[i]} <= pivot ${pivot}.`,
          });
        }
      }

      [a[i + 1], a[high]] = [a[high], a[i + 1]];
      localSteps.push({
        array: [...a],
        left: low,
        right: high,
        pivotIndex: i + 1,
        i: i + 1,
        j: high,
        phase: "partition",
        description: `Placed pivot ${pivot} at its correct position index ${i + 1}.`,
      });

      return i + 1;
    };

    const quickSortRec = (a: number[], low: number, high: number) => {
      if (low < high) {
        const pi = partition(a, low, high);

        localSteps.push({
          array: [...a],
          left: low,
          right: pi - 1,
          pivotIndex: pi,
          i: -1,
          j: -1,
          phase: "recurse",
          description: `Recursively sorting left partition [${low}..${pi - 1}].`,
        });
        quickSortRec(a, low, pi - 1);

        localSteps.push({
          array: [...a],
          left: pi + 1,
          right: high,
          pivotIndex: pi,
          i: -1,
          j: -1,
          phase: "recurse",
          description: `Recursively sorting right partition [${pi + 1}..${high}].`,
        });
        quickSortRec(a, pi + 1, high);
      }
    };

    quickSortRec(arrCopy, 0, arrCopy.length - 1);

    return localSteps;
  };

  const runQuickSort = async () => {
    if (isRunning || array.length <= 1) return;

    const collectedSteps = collectQuickSortSteps(array);
    if (collectedSteps.length === 0) return;

    setSteps(collectedSteps);
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setArray(collectedSteps[0].array);
    setComparisons(0);
    setSwaps(0);

    for (let idx = 0; idx < collectedSteps.length; idx++) {
      if (!isRunning && idx !== 0) break;

      const step = collectedSteps[idx];
      setCurrentStepIndex(idx);
      setArray(step.array);

      if (step.phase === "partition") {
        if (step.j >= 0) {
          setComparisons((prev) => prev + 1);
        }
        if (step.description.startsWith("Swapped")) {
          setSwaps((prev) => prev + 1);
        }
      }

      if (isPaused) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve) => {
          const check = () => {
            if (!isPaused) {
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      }

      // eslint-disable-next-line no-await-in-loop
      await delay(900 - speed[0] * 8);
    }

    setIsRunning(false);
    setIsPaused(false);
  };

  const pauseSorting = () => {
    setIsPaused(true);
  };

  const resumeSorting = () => {
    setIsPaused(false);
  };

  const stopSorting = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const currentStep: Step | null =
    steps.length > 0 ? steps[currentStepIndex] : null;

  const getElementClass = (index: number) => {
    let classes =
      "array-element w-14 h-14 flex flex-col items-center justify-center rounded-lg text-sm font-semibold";

    if (!currentStep) {
      classes += " bg-slate-800 text-slate-100 border border-slate-600";
      return classes;
    }

    const { left, right, pivotIndex, i, j } = currentStep;

    if (index < left || index > right) {
      classes += " bg-slate-700 text-slate-300 border border-slate-600 opacity-60";
    } else {
      classes += " bg-slate-800 text-slate-100 border border-slate-600";
    }

    if (index === pivotIndex) {
      classes +=
        " bg-purple-600 text-white ring-2 ring-purple-300 scale-105 shadow-lg";
    } else if (index === i) {
      classes +=
        " bg-emerald-600 text-white ring-2 ring-emerald-300 scale-105 shadow-md";
    } else if (index === j) {
      classes +=
        " bg-blue-600 text-white ring-2 ring-blue-300 scale-105 shadow-md";
    }

    return classes;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Quick Sort Visualization
      </h1>

      <div className="flex justify-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card className="p-6 mb-8 bg-gradient-to-br from-rose-50 to-purple-50 dark:from-rose-950/30 dark:to-purple-950/30">
        <h2 className="text-2xl font-semibold mb-4">About Quick Sort</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-rose-200 dark:border-rose-800 bg-white/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2 text-rose-800 dark:text-rose-300">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Quick Sort</strong> is a divide-and-conquer sorting algorithm that sorts an array by choosing a &quot;pivot&quot; element, partitioning the array so that all elements less than or equal to the pivot are on its left and all greater elements are on its right, placing the pivot in its final sorted position, and then recursively sorting the left and right subarrays. Average time is O(n log n); worst case is O(n²) depending on pivot choice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Overview</h3>
            <p className="text-muted-foreground mb-4">
              Quick sort is a divide-and-conquer sorting algorithm. It selects a
              pivot element, partitions the array into elements less than or
              equal to the pivot and greater than the pivot, and then recursively
              sorts the partitions.
            </p>
            <div className="mb-2">
              <span className="font-semibold text-sm">Average Time Complexity:</span>
              <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">
                O(n log n)
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-sm">Worst-case Time Complexity:</span>
              <span className="ml-2 text-sm bg-red-100 dark:bg-red-900 px-2 py-1 rounded-md">
                O(n²)
              </span>
            </div>
            <div>
              <span className="font-semibold text-sm">Space Complexity:</span>
              <span className="ml-2 text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">
                O(log n) average (due to recursion stack)
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Key Concepts</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Divide-and-conquer approach</li>
              <li>Partition step reorders elements around a pivot</li>
              <li>Very fast in practice for large datasets</li>
              <li>Performance depends heavily on pivot selection</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={runQuickSort}
              disabled={isRunning && !isPaused || array.length <= 1}
              variant="default"
              className="bg-rose-600 hover:bg-rose-700"
            >
              <Play className="h-4 w-4 mr-1" /> Run Quick Sort
            </Button>

            <Button
              onClick={generateRandomArray}
              disabled={isRunning && !isPaused}
              variant="secondary"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Generate Random Array
            </Button>

            {isRunning && (
              <Button
                onClick={isPaused ? resumeSorting : pauseSorting}
                variant="outline"
                className="border-amber-500 text-amber-600"
              >
                {isPaused ? (
                  <Play className="h-4 w-4 mr-1" />
                ) : (
                  <Pause className="h-4 w-4 mr-1" />
                )}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}

            {isRunning && (
              <Button
                onClick={stopSorting}
                variant="destructive"
                size="sm"
              >
                Stop
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm whitespace-nowrap">Speed:</span>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={1}
                max={100}
                step={1}
                disabled={isRunning && !isPaused}
                className="w-32"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="custom-array">Custom Array (comma-separated)</Label>
              <Input
                id="custom-array"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g., 8,3,5,1,9,2"
                disabled={isRunning && !isPaused}
              />
            </div>
            <Button
              onClick={handleCustomArray}
              disabled={isRunning && !isPaused}
              variant="outline"
            >
              Set Custom Array
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="array-size">Array Size</Label>
            <Input
              id="array-size"
              type="number"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              min={5}
              max={14}
              className="w-20"
              disabled={isRunning && !isPaused}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Current Step
              </h3>
              <p className="text-2xl font-bold">
                {steps.length > 0 ? `${currentStepIndex + 1} / ${steps.length}` : "—"}
              </p>
            </Card>
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Comparisons
              </h3>
              <p className="text-2xl font-bold">{comparisons}</p>
            </Card>
            <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Swaps
              </h3>
              <p className="text-2xl font-bold">{swaps}</p>
            </Card>
          </div>

          {currentStep && (
            <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-100 dark:border-teal-900">
              <h3 className="text-sm font-medium mb-1">Current Step</h3>
              <p className="text-md">{currentStep.description}</p>
            </Card>
          )}
        </div>
      </Card>

      <Card className="p-6 mb-8 bg-slate-50 dark:bg-slate-900/20">
        <h2 className="text-xl font-semibold mb-4">Visualization</h2>
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg min-h-[150px]">
            {array.map((value, index) => (
              <div key={index} className={getElementClass(index)}>
                <span className="text-lg font-bold text-white">{value}</span>
                <span className="text-xs mt-1 text-slate-200">
                  idx: {index}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-700 border border-slate-600 rounded"></div>
              <span>Outside current partition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-800 border border-slate-600 rounded"></div>
              <span>Inside current partition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-purple-600 border border-purple-300 rounded"></div>
              <span>Pivot element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-emerald-600 border border-emerald-300 rounded"></div>
              <span>i / boundary of ≤ pivot</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Definition &amp; Step-by-Step Working</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Quick Sort</strong> sorts by repeatedly partitioning the array around a pivot (here we use the last element in each range). The partition step places all elements ≤ pivot before it and all &gt; pivot after it, so the pivot reaches its final sorted index. The same process is then applied recursively to the left and right subarrays until each subarray has at most one element.
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-3">Step-by-step working (Lomuto partition)</h3>
        <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
          <li>
            <strong className="text-foreground">Choose a pivot.</strong> For the segment <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[low..high]</code>, set <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">pivot = array[high]</code>.
          </li>
          <li>
            <strong className="text-foreground">Partition.</strong> Use index <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i</code> such that <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[low..i]</code> contains elements ≤ pivot. For <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">j</code> from low to high−1: if <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[j] ≤ pivot</code>, swap <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[j]</code> with <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[++i]</code>.
          </li>
          <li>
            <strong className="text-foreground">Place pivot.</strong> Swap <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[i+1]</code> with <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[high]</code>. Pivot is now at index <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">pi = i+1</code>.
          </li>
          <li>
            <strong className="text-foreground">Recurse.</strong> Sort <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[low..pi−1]</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[pi+1..high]</code>. If a segment has 0 or 1 element, it is already sorted (base case).
          </li>
        </ol>

        <div className="mt-6 p-4 border bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="text-lg font-medium mb-2">
            Why Quick Sort is Powerful
          </h3>
          <p>
            Quick sort is one of the fastest general-purpose sorting algorithms in
            practice, especially on average. With good pivot selection and
            in-place partitioning, it achieves excellent cache performance and low
            memory overhead, making it a common choice in real-world libraries.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <CheatSheetDownload
            fileName="quick-sort-cheatsheet.txt"
            title="Quick Sort (Lomuto)"
            definition="Quick Sort is a divide-and-conquer sorting algorithm that partitions the array around a pivot so that elements ≤ pivot come before it and elements > pivot come after it, then recursively sorts both sides."
            steps={[
              "Pick a pivot element for the current range (Lomuto uses the last element).",
              "Partition: move elements ≤ pivot to the left side while scanning; maintain a boundary index i.",
              "Place the pivot in its final position by swapping it with array[i+1].",
              "Recursively apply quick sort to the left subarray and right subarray.",
              "Stop recursion when a subarray has 0 or 1 element.",
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

