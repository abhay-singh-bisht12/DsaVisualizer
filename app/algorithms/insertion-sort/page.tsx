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
  key: number | null;
  description: string;
};

export default function InsertionSortPage() {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(10);
  const [currentI, setCurrentI] = useState<number>(-1);
  const [currentJ, setCurrentJ] = useState<number>(-1);
  const [keyIndex, setKeyIndex] = useState<number>(-1);
  const [sortedBoundary, setSortedBoundary] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number[]>([50]);
  const [customInput, setCustomInput] = useState<string>("");
  const [stepInfo, setStepInfo] = useState<StepInfo | null>(null);
  const [comparisons, setComparisons] = useState<number>(0);
  const [shifts, setShifts] = useState<number>(0);

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
    setKeyIndex(-1);
    setSortedBoundary(0);
    setIsRunning(false);
    setIsPaused(false);
    setStepInfo(null);
    setComparisons(0);
    setShifts(0);
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

  const insertionSort = async () => {
    if (isRunning || array.length <= 1) return;

    setIsRunning(true);
    setIsPaused(false);
    setStepInfo({
      i: -1,
      j: -1,
      key: null,
      description: "Starting Insertion Sort algorithm",
    });
    await delay(800 - speed[0] * 7);

    const arr = [...array];

    for (let i = 1; i < arr.length; i++) {
      setSortedBoundary(i);
      setCurrentI(i);
      const key = arr[i];
      setKeyIndex(i);
      setStepInfo({
        i,
        j: i - 1,
        key,
        description: `Picking element ${key} at index ${i} to insert into the sorted left part`,
      });
      await delay(800 - speed[0] * 7);

      let j = i - 1;

      while (j >= 0 && arr[j] > key) {
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

        setComparisons((prev) => prev + 1);
        setCurrentJ(j);
        setStepInfo({
          i,
          j,
          key,
          description: `Comparing key ${key} with ${arr[j]} at index ${j}. Since ${arr[j]} > ${key}, shifting it to the right.`,
        });
        await delay(800 - speed[0] * 7);

        arr[j + 1] = arr[j];
        setShifts((prev) => prev + 1);
        setArray([...arr]);

        j--;
      }

      if (j >= 0) {
        setComparisons((prev) => prev + 1);
      }

      arr[j + 1] = key;
      setArray([...arr]);
      setKeyIndex(j + 1);
      setStepInfo({
        i,
        j,
        key,
        description: `Inserted key ${key} at correct position index ${j + 1}. Left part [0..${i}] is now sorted.`,
      });
      await delay(800 - speed[0] * 7);
    }

    setSortedBoundary(arr.length);
    setCurrentI(-1);
    setCurrentJ(-1);
    setKeyIndex(-1);
    setStepInfo({
      i: -1,
      j: -1,
      key: null,
      description: "Array is now fully sorted using Insertion Sort!",
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
    setKeyIndex(-1);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const getElementClass = (index: number) => {
    let classes =
      "array-element w-14 h-14 flex flex-col items-center justify-center rounded-lg text-sm font-semibold";

    if (index < sortedBoundary) {
      classes += " bg-green-500 text-white border border-green-300";
    } else {
      classes += " bg-slate-800 text-slate-100 border border-slate-600";
    }

    if (index === keyIndex) {
      classes +=
        " ring-2 ring-amber-400 bg-amber-500 text-slate-900 scale-105 shadow-lg";
    } else if (index === currentJ) {
      classes +=
        " ring-2 ring-blue-400 bg-blue-500 text-white scale-105 shadow-md";
    }

    return classes;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Insertion Sort Visualization
      </h1>

      <div className="flex justify-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card className="p-6 mb-8 bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950/30 dark:to-sky-950/30">
        <h2 className="text-2xl font-semibold mb-4">About Insertion Sort</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 bg-white/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2 text-indigo-800 dark:text-indigo-300">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Insertion Sort</strong> is a simple, in-place comparison-based sorting algorithm that builds the final sorted array one element at a time. It maintains a sorted subarray on the left; for each new element (key), it finds the correct position within that sorted part and inserts the key there by shifting larger elements to the right. It is stable and efficient for small or nearly sorted data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Overview</h3>
            <p className="text-muted-foreground mb-4">
              Insertion sort builds the final sorted array one item at a time.
              It takes each element and inserts it into its correct position in
              the already sorted part of the array.
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
              <li>Maintains a sorted subarray on the left side</li>
              <li>
                Picks the next element (key) and inserts it into the sorted part
              </li>
              <li>Efficient for nearly sorted or small arrays</li>
              <li>In-place and stable sorting algorithm</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={insertionSort}
              disabled={isRunning && !isPaused || array.length <= 1}
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Play className="h-4 w-4 mr-1" /> Run Insertion Sort
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
                Current i (key position)
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
                Comparisons / Shifts
              </h3>
              <p className="text-2xl font-bold">
                {comparisons} / {shifts}
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
              <span>Key element</span>
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
            <strong>Insertion Sort</strong> sorts an array by repeatedly taking the next unsorted element (the &quot;key&quot;) and inserting it into its correct position in the already-sorted left portion. Elements greater than the key are shifted one place to the right to make space. The process repeats until every element has been inserted; the array is then fully sorted.
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-3">Step-by-step working</h3>
        <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
          <li>
            <strong className="text-foreground">Assume the first element is sorted.</strong> The sorted region is <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[0..0]</code>.
          </li>
          <li>
            <strong className="text-foreground">Pick the next element as key.</strong> For <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i = 1, 2, ..., n-1</code>, set <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">key = array[i]</code>.
          </li>
          <li>
            <strong className="text-foreground">Scan the sorted part from right to left.</strong> Set <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">j = i - 1</code>. While <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">j ≥ 0</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[j] &gt; key</code>, shift <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[j]</code> to <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[j+1]</code> and decrement <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">j</code>.
          </li>
          <li>
            <strong className="text-foreground">Insert the key.</strong> Place <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">key</code> at <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[j+1]</code>. The sorted region is now <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[0..i]</code>.
          </li>
          <li>
            <strong className="text-foreground">Repeat</strong> from step 2 for the next <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i</code> until <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i = n</code>. The array is fully sorted.
          </li>
        </ol>

        <div className="mt-6 p-4 border bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="text-lg font-medium mb-2">
            When is Insertion Sort Useful?
          </h3>
          <p>
            Insertion sort performs very well on small or nearly sorted arrays
            and is often used as a building block inside more complex sorting
            algorithms. It is in-place and stable, which makes it useful in
            certain scenarios where memory is limited or stability matters.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <CheatSheetDownload
            fileName="insertion-sort-cheatsheet.txt"
            title="Insertion Sort"
            definition="Insertion Sort sorts an array by building a sorted region on the left and inserting each next element (key) into its correct position by shifting larger elements to the right."
            steps={[
              "Assume the first element is already sorted (sorted region starts at index 0).",
              "For i from 1 to n−1, pick key = array[i].",
              "Compare key with elements in the sorted region from right to left (j = i−1).",
              "While j ≥ 0 and array[j] > key, shift array[j] one position right (to array[j+1]) and decrement j.",
              "Insert key at array[j+1]; the sorted region grows. Repeat until the array is sorted.",
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

