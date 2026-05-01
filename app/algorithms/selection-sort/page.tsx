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

type StepInfo = {
  i: number;
  j: number;
  minIndex: number;
  description: string;
};

export default function SelectionSortPage() {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(10);
  const [currentI, setCurrentI] = useState<number>(-1);
  const [currentJ, setCurrentJ] = useState<number>(-1);
  const [minIndex, setMinIndex] = useState<number>(-1);
  const [sortedBoundary, setSortedBoundary] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number[]>([50]);
  const [customInput, setCustomInput] = useState<string>("");
  const [stepInfo, setStepInfo] = useState<StepInfo | null>(null);
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
    const size = Math.min(Math.max(5, arraySize), 20);
    const newArray = Array.from(
      { length: size },
      () => Math.floor(Math.random() * 50) + 1
    );
    resetState(newArray);
  };

  const resetState = (arr = array) => {
    setArray(arr);
    setCurrentI(-1);
    setCurrentJ(-1);
    setMinIndex(-1);
    setSortedBoundary(-1);
    setIsRunning(false);
    setIsPaused(false);
    setStepInfo(null);
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

  const selectionSort = async () => {
    if (isRunning || array.length <= 1) return;

    setIsRunning(true);
    setIsPaused(false);
    setStepInfo({
      i: -1,
      j: -1,
      minIndex: -1,
      description: "Starting Selection Sort algorithm",
    });
    await delay(800 - speed[0] * 7);

    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      setCurrentI(i);
      setSortedBoundary(i - 1);
      let minIdx = i;
      setMinIndex(i);
      setStepInfo({
        i,
        j: i + 1,
        minIndex: i,
        description: `Starting pass ${i + 1}: assume element at index ${i} (value ${arr[i]}) is the minimum.`,
      });
      await delay(800 - speed[0] * 7);

      for (let j = i + 1; j < n; j++) {
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

        setCurrentJ(j);
        setComparisons((prev) => prev + 1);
        setStepInfo({
          i,
          j,
          minIndex: minIdx,
          description: `Comparing current minimum ${arr[minIdx]} (index ${minIdx}) with ${arr[j]} at index ${j}.`,
        });
        // eslint-disable-next-line no-await-in-loop
        await delay(800 - speed[0] * 7);

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          setMinIndex(j);
          setStepInfo({
            i,
            j,
            minIndex: j,
            description: `Found new minimum value ${arr[j]} at index ${j}.`,
          });
          // eslint-disable-next-line no-await-in-loop
          await delay(800 - speed[0] * 7);
        }
      }

      if (minIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        setSwaps((prev) => prev + 1);
        setArray([...arr]);
        setStepInfo({
          i,
          j: -1,
          minIndex: minIdx,
          description: `Swapping element at index ${i} (value ${temp}) with minimum at index ${minIdx} (value ${arr[i]}).`,
        });
        await delay(800 - speed[0] * 7);
      } else {
        setStepInfo({
          i,
          j: -1,
          minIndex: minIdx,
          description: `Minimum already at correct position index ${i}, no swap needed.`,
        });
        await delay(600 - speed[0] * 5);
      }
    }

    setSortedBoundary(n - 1);
    setCurrentI(-1);
    setCurrentJ(-1);
    setMinIndex(-1);
    setStepInfo({
      i: -1,
      j: -1,
      minIndex: -1,
      description: "Array is now fully sorted using Selection Sort!",
    });
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
    setCurrentI(-1);
    setCurrentJ(-1);
    setMinIndex(-1);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const getElementClass = (index: number) => {
    let classes =
      "array-element w-14 h-14 flex flex-col items-center justify-center rounded-lg text-sm font-semibold";

    if (index <= sortedBoundary) {
      classes += " bg-green-500 text-white border border-green-300";
    } else {
      classes += " bg-slate-800 text-slate-100 border border-slate-600";
    }

    if (index === minIndex) {
      classes +=
        " ring-2 ring-amber-400 bg-amber-500 text-slate-900 scale-105 shadow-lg";
    } else if (index === currentJ) {
      classes +=
        " ring-2 ring-blue-400 bg-blue-500 text-white scale-105 shadow-md";
    } else if (index === currentI) {
      classes += " border-2 border-purple-400";
    }

    return classes;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Selection Sort Visualization
      </h1>

      <div className="flex justify-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card className="p-6 mb-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <h2 className="text-2xl font-semibold mb-4">About Selection Sort</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Selection Sort</strong> is an in-place comparison-based sorting algorithm that divides the array into a sorted region (left) and an unsorted region (right). In each pass, it finds the smallest element in the unsorted region and swaps it with the first element of the unsorted region, thereby extending the sorted region by one. It does at most <em>n−1</em> swaps and is simple but inefficient for large arrays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Overview</h3>
            <p className="text-muted-foreground mb-4">
              Selection sort repeatedly selects the smallest element from the
              unsorted portion of the array and swaps it with the first unsorted
              element, growing the sorted portion from left to right.
            </p>
            <div className="mb-2">
              <span className="font-semibold text-sm">Time Complexity:</span>
              <span className="ml-2 text-sm bg-red-100 dark:bg-red-900 px-2 py-1 rounded-md">
                O(n²)
              </span>
            </div>
            <div>
              <span className="font-semibold text-sm">Space Complexity:</span>
              <span className="ml-2 text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">
                O(1)
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Key Concepts</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Divides the array into sorted and unsorted regions</li>
              <li>Finds the minimum element in the unsorted region each pass</li>
              <li>Swaps it into the first position of the unsorted region</li>
              <li>Simple to understand but not efficient for large arrays</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={selectionSort}
              disabled={isRunning && !isPaused || array.length <= 1}
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Play className="h-4 w-4 mr-1" /> Run Selection Sort
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
              max={20}
              className="w-20"
              disabled={isRunning && !isPaused}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Current i (sorted boundary)
              </h3>
              <p className="text-2xl font-bold">
                {currentI >= 0 ? currentI : "—"}
              </p>
            </Card>
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Current j (scan index)
              </h3>
              <p className="text-2xl font-bold">
                {currentJ >= 0 ? currentJ : "—"}
              </p>
            </Card>
            <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Comparisons / Swaps
              </h3>
              <p className="text-2xl font-bold">
                {comparisons} / {swaps}
              </p>
            </Card>
          </div>

          {stepInfo && (
            <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-100 dark:border-teal-900">
              <h3 className="text-sm font-medium mb-1">Current Step</h3>
              <p className="text-md">{stepInfo.description}</p>
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
              <div className="h-4 w-4 bg-slate-800 border border-slate-600 rounded"></div>
              <span>Unsorted element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-500 border border-green-300 rounded"></div>
              <span>In sorted part</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-amber-500 border border-amber-400 rounded"></div>
              <span>Current minimum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-500 border border-blue-300 rounded"></div>
              <span>Element being compared</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Definition &amp; Step-by-Step Working</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Selection Sort</strong> sorts an array by repeatedly selecting the smallest (or largest) element from the unsorted portion and swapping it with the first element of the unsorted portion. After each pass, the sorted portion grows by one element from the left. No assumption is made about initial order; the number of swaps is at most <em>n−1</em>.
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-3">Step-by-step working</h3>
        <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
          <li>
            <strong className="text-foreground">Initialize.</strong> Sorted region is empty; unsorted region is the whole array <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[0..n-1]</code>.
          </li>
          <li>
            <strong className="text-foreground">For each position <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i</code> from 0 to n−2:</strong>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Find the index <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">minIdx</code> of the smallest element in <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[i..n-1]</code>.</li>
              <li>Swap <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[i]</code> with <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[minIdx]</code>.</li>
              <li>The sorted region is now <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[0..i]</code>; unsorted is <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[i+1..n-1]</code>.</li>
            </ul>
          </li>
          <li>
            <strong className="text-foreground">After the last pass,</strong> the element at index <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">n−1</code> is already in place. The array is fully sorted.
          </li>
        </ol>

        <div className="mt-6 p-4 border bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="text-lg font-medium mb-2">
            When is Selection Sort Useful?
          </h3>
          <p>
            Selection sort is conceptually simple and performs a minimal number
            of swaps, which can be beneficial when write operations are expensive.
            However, due to its O(n²) time complexity, it is not suitable for
            large datasets in practice.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <CheatSheetDownload
            fileName="selection-sort-cheatsheet.txt"
            title="Selection Sort"
            definition="Selection Sort sorts an array by repeatedly finding the minimum element in the unsorted portion and swapping it into the next position of the sorted portion."
            steps={[
              "Treat the array as two parts: sorted (left) and unsorted (right). Initially, sorted is empty.",
              "For i from 0 to n−2, set minIdx = i.",
              "Scan j from i+1 to n−1; if array[j] < array[minIdx], update minIdx.",
              "After the scan, swap array[i] and array[minIdx].",
              "Increase i (sorted region grows) and repeat until the array is sorted.",
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

