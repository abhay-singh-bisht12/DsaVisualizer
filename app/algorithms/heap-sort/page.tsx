"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { Home, Play, Pause, RefreshCw } from "lucide-react";
import { CheatSheetDownload } from "@/components/cheatsheet-download";

type Step = {
  array: number[];
  heapSize: number;
  i: number;
  left: number;
  right: number;
  largest: number;
  swapping?: [number, number];
  description: string;
};

export default function HeapSortPage() {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(10);
  const [customInput, setCustomInput] = useState<string>("");
  const [speed, setSpeed] = useState<number[]>([50]);

  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateRandomArray();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arraySize]);

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      timerRef.current = setTimeout(resolve, ms);
    });

  const resetRuntime = (arr = array) => {
    setArray(arr);
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const generateRandomArray = () => {
    const size = Math.min(Math.max(5, arraySize), 16);
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 1);
    resetRuntime(newArray);
  };

  const handleCustomArray = () => {
    try {
      const numbers = customInput
        .split(",")
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n));
      if (numbers.length > 0) {
        resetRuntime(numbers);
      }
    } catch (e) {
      console.error("Invalid input");
    }
  };

  const collectSteps = (input: number[]): Step[] => {
    const a = [...input];
    const local: Step[] = [];

    const push = (opts: Omit<Step, "array"> & { array?: number[] }) => {
      local.push({
        array: opts.array ? [...opts.array] : [...a],
        heapSize: opts.heapSize,
        i: opts.i,
        left: opts.left,
        right: opts.right,
        largest: opts.largest,
        swapping: opts.swapping,
        description: opts.description,
      });
    };

    const heapify = (n: number, i: number) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      push({
        heapSize: n,
        i,
        left,
        right,
        largest,
        description: `Heapify at index ${i}. Compare with children (left=${left}, right=${right}) within heap size ${n}.`,
      });

      if (left < n && a[left] > a[largest]) {
        largest = left;
        push({
          heapSize: n,
          i,
          left,
          right,
          largest,
          description: `Left child a[${left}] = ${a[left]} is larger. New largest index = ${largest}.`,
        });
      }

      if (right < n && a[right] > a[largest]) {
        largest = right;
        push({
          heapSize: n,
          i,
          left,
          right,
          largest,
          description: `Right child a[${right}] = ${a[right]} is larger. New largest index = ${largest}.`,
        });
      }

      if (largest !== i) {
        push({
          heapSize: n,
          i,
          left,
          right,
          largest,
          swapping: [i, largest],
          description: `Swap a[${i}] = ${a[i]} with a[${largest}] = ${a[largest]} to fix heap property.`,
        });
        [a[i], a[largest]] = [a[largest], a[i]];
        push({
          heapSize: n,
          i,
          left,
          right,
          largest,
          description: `After swap, continue heapify down from index ${largest}.`,
        });
        heapify(n, largest);
      }
    };

    // Build max heap
    push({
      heapSize: a.length,
      i: -1,
      left: -1,
      right: -1,
      largest: -1,
      description: "Build a max heap from the array (bottom-up heapify).",
    });
    for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) {
      heapify(a.length, i);
    }
    push({
      heapSize: a.length,
      i: -1,
      left: -1,
      right: -1,
      largest: -1,
      description: "Max heap built. The largest element is at the root (index 0).",
    });

    // Extract elements
    for (let end = a.length - 1; end > 0; end--) {
      push({
        heapSize: end + 1,
        i: 0,
        left: 1,
        right: 2,
        largest: 0,
        swapping: [0, end],
        description: `Swap max element a[0] = ${a[0]} with a[${end}] = ${a[end]}. Place max at the end.`,
      });
      [a[0], a[end]] = [a[end], a[0]];
      push({
        heapSize: end,
        i: 0,
        left: 1,
        right: 2,
        largest: 0,
        description: `Reduce heap size to ${end}. Heapify at root to restore max heap.`,
      });
      heapify(end, 0);
    }

    push({
      heapSize: 0,
      i: -1,
      left: -1,
      right: -1,
      largest: -1,
      description: "Heap sort completed. Array is fully sorted.",
    });

    return local;
  };

  const run = async () => {
    if (isRunning || array.length <= 1) return;

    const local = collectSteps(array);
    setSteps(local);
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);

    for (let idx = 0; idx < local.length; idx++) {
      setCurrentStep(idx);
      setArray(local[idx].array);

      if (isPaused) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve) => {
          const check = () => {
            if (!isPaused) resolve();
            else setTimeout(check, 100);
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

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);
  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const active = steps[currentStep] ?? null;

  const isSortedIndex = (idx: number) => {
    if (!active) return false;
    return idx >= active.heapSize && active.heapSize > 0;
  };

  const getElementClass = (idx: number) => {
    let base =
      "w-14 h-14 flex flex-col items-center justify-center rounded-lg border transition-all duration-300";
    base += " bg-slate-900/40 border-slate-700 text-slate-100";

    if (isSortedIndex(idx)) {
      base += " bg-emerald-600/35 border-emerald-500 text-white";
    }

    if (active?.swapping && (idx === active.swapping[0] || idx === active.swapping[1])) {
      base += " ring-2 ring-amber-300 bg-amber-600/35 border-amber-500 scale-105";
    } else if (active && idx === active.i && idx >= 0) {
      base += " ring-2 ring-blue-300 bg-blue-600/35 border-blue-500 scale-105";
    } else if (active && idx === active.largest && idx >= 0) {
      base += " ring-2 ring-purple-300 bg-purple-600/35 border-purple-500 scale-105";
    }

    return base;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Heap Sort Visualization</h1>

      <div className="flex justify-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card className="p-6 mb-8 bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-950/30 dark:to-cyan-950/30">
        <h2 className="text-2xl font-semibold mb-4">About Heap Sort</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-violet-200 dark:border-violet-800 bg-white/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2 text-violet-800 dark:text-violet-300">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Heap Sort</strong> is an in-place comparison-based sorting algorithm that first builds a <strong>max heap</strong> (largest at the root),
            then repeatedly swaps the root with the last element of the heap and reduces the heap size, restoring the heap property each time via heapify.
            It guarantees O(n log n) time and uses O(1) extra space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Complexity</h3>
            <div className="mb-2">
              <span className="font-semibold text-sm">Time Complexity:</span>
              <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">O(n log n)</span>
            </div>
            <div>
              <span className="font-semibold text-sm">Space Complexity:</span>
              <span className="ml-2 text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">O(1)</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Key Concepts</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Max heap: parent ≥ children</li>
              <li>Build heap bottom-up using heapify</li>
              <li>Extract max repeatedly to the end</li>
              <li>Restore heap property after each extraction</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={run}
              disabled={isRunning && !isPaused || array.length <= 1}
              variant="default"
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Play className="h-4 w-4 mr-1" /> Run Heap Sort
            </Button>

            <Button onClick={generateRandomArray} disabled={isRunning && !isPaused} variant="secondary">
              <RefreshCw className="h-4 w-4 mr-1" /> Generate Random Array
            </Button>

            {isRunning && (
              <Button onClick={isPaused ? resume : pause} variant="outline" className="border-amber-500 text-amber-600">
                {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}

            {isRunning && (
              <Button onClick={stop} variant="destructive" size="sm">
                Stop
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm whitespace-nowrap">Speed:</span>
              <Slider value={speed} onValueChange={setSpeed} min={1} max={100} step={1} disabled={isRunning && !isPaused} className="w-32" />
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
            <Button onClick={handleCustomArray} disabled={isRunning && !isPaused} variant="outline">
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
              max={16}
              className="w-20"
              disabled={isRunning && !isPaused}
            />
          </div>

          {active && (
            <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-100 dark:border-teal-900">
              <h3 className="text-sm font-medium mb-1">Current Step</h3>
              <p className="text-md">{active.description}</p>
            </Card>
          )}
        </div>
      </Card>

      <Card className="p-6 mb-8 bg-slate-50 dark:bg-slate-900/20">
        <h2 className="text-xl font-semibold mb-4">Visualization</h2>
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg min-h-[150px]">
            {array.map((value, idx) => (
              <div key={idx} className={getElementClass(idx)}>
                <span className="text-lg font-bold">{value}</span>
                <span className="text-xs mt-1 text-slate-300">idx: {idx}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-600/35 border border-blue-500 rounded"></div>
              <span>Current heapify index i</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-purple-600/35 border border-purple-500 rounded"></div>
              <span>Current largest candidate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-amber-600/35 border border-amber-500 rounded"></div>
              <span>Swapping indices</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-emerald-600/35 border border-emerald-500 rounded"></div>
              <span>Sorted tail</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Definition &amp; Step-by-Step Working</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            Heap sort uses a max heap to repeatedly select the largest remaining element. After building the heap, the root (maximum) is swapped to the end,
            the heap size shrinks, and heapify restores the max heap property. Repeating this places elements in sorted order.
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-3">Step-by-step working</h3>
        <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
          <li>Build a max heap from the array (heapify from the last non-leaf down to the root).</li>
          <li>Swap the maximum element at index 0 with the last element in the heap.</li>
          <li>Reduce the heap size by 1 (the last element is now sorted).</li>
          <li>Heapify the root to restore the max heap property.</li>
          <li>Repeat steps 2–4 until the heap size becomes 1. The array is sorted.</li>
        </ol>

        <div className="mt-6 flex justify-end">
          <CheatSheetDownload
            fileName="heap-sort-cheatsheet.txt"
            title="Heap Sort"
            definition="Heap Sort builds a max heap and repeatedly extracts the maximum element by swapping the root with the last element, shrinking the heap, and heapifying, producing a sorted array in O(n log n) time."
            steps={[
              "Build a max heap from the array.",
              "Swap the root (max) with the last element in the heap.",
              "Decrease heap size by 1 (the last element is now fixed in sorted position).",
              "Heapify the root to restore max heap property.",
              "Repeat until the heap is of size 1.",
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

