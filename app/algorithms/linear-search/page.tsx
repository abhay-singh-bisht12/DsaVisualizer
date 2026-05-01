"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Home, Search, RefreshCw, Play, Pause } from "lucide-react";
import { CheatSheetDownload } from "@/components/cheatsheet-download";

type StepInfo = {
  index: number;
  value: number | null;
  found: boolean;
  description: string;
};

export default function LinearSearchPage() {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(10);
  const [target, setTarget] = useState<number | null>(null);
  const [customTarget, setCustomTarget] = useState<string>("");
  const [customInput, setCustomInput] = useState<string>("");

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [foundIndex, setFoundIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number[]>([50]);
  const [stepInfo, setStepInfo] = useState<StepInfo | null>(null);
  const [comparisons, setComparisons] = useState<number>(0);

  useEffect(() => {
    generateRandomArray();
  }, [arraySize]);

  const generateRandomArray = () => {
    const size = Math.min(Math.max(5, arraySize), 30);
    const newArray = Array.from(
      { length: size },
      () => Math.floor(Math.random() * 100)
    );
    setArray(newArray);
    resetState(newArray);
  };

  const resetState = (arr = array, newTarget: number | null = null) => {
    setArray(arr);
    setTarget(
      newTarget !== null
        ? newTarget
        : arr.length > 0
          ? arr[Math.floor(Math.random() * arr.length)]
          : null
    );
    setCurrentIndex(-1);
    setFoundIndex(-1);
    setIsRunning(false);
    setIsPaused(false);
    setStepInfo(null);
    setComparisons(0);
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

  const handleCustomTarget = () => {
    const parsed = parseInt(customTarget.trim());
    if (!isNaN(parsed)) {
      setTarget(parsed);
      setFoundIndex(-1);
      setCurrentIndex(-1);
      setStepInfo(null);
      setComparisons(0);
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const runLinearSearch = async () => {
    if (isRunning || target === null || array.length === 0) return;

    setIsRunning(true);
    setIsPaused(false);
    setFoundIndex(-1);
    setCurrentIndex(-1);
    setComparisons(0);
    setStepInfo({
      index: -1,
      value: null,
      found: false,
      description: `Starting linear search for value ${target}`,
    });

    for (let i = 0; i < array.length; i++) {
      // Handle pause
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

      setCurrentIndex(i);
      setComparisons((prev) => prev + 1);
      setStepInfo({
        index: i,
        value: array[i],
        found: false,
        description: `Comparing element at index ${i} (value ${array[i]}) with target ${target}`,
      });

      // eslint-disable-next-line no-await-in-loop
      await delay(800 - speed[0] * 7);

      if (array[i] === target) {
        setFoundIndex(i);
        setStepInfo({
          index: i,
          value: array[i],
          found: true,
          description: `Found target ${target} at index ${i}!`,
        });
        // eslint-disable-next-line no-await-in-loop
        await delay(800 - speed[0] * 7);
        setIsRunning(false);
        setIsPaused(false);
        return;
      }
    }

    setStepInfo({
      index: -1,
      value: null,
      found: false,
      description: `Reached end of array. Target ${target} not found.`,
    });
    setIsRunning(false);
    setIsPaused(false);
  };

  const pauseSearch = () => {
    setIsPaused(true);
  };

  const resumeSearch = () => {
    setIsPaused(false);
  };

  const stopSearch = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentIndex(-1);
  };

  const getElementClass = (index: number) => {
    let classes =
      "array-element w-14 h-14 flex flex-col items-center justify-center rounded-lg text-sm font-semibold";

    if (index === foundIndex) {
      classes +=
        " bg-green-500 text-white ring-2 ring-green-300 scale-110 shadow-lg";
    } else if (index === currentIndex) {
      classes +=
        " bg-blue-500 text-white ring-2 ring-blue-300 scale-105 shadow-md";
    } else if (array[index] === target) {
      classes +=
        " bg-amber-400 text-slate-900 border border-amber-500 shadow-sm";
    } else {
      classes +=
        " bg-slate-800 text-slate-100 border border-slate-600 shadow-sm";
    }

    return classes;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Linear Search Visualization
      </h1>

      <div className="flex justify-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card className="p-6 mb-8 bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/30">
        <h2 className="text-2xl font-semibold mb-4">About Linear Search</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-white/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Linear Search</strong> is a searching algorithm that finds the position of a target value within an array by checking each element sequentially from the start until the target is found or the end of the array is reached. It works on both sorted and unsorted arrays and requires no preprocessing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Overview</h3>
            <p className="text-muted-foreground mb-4">
              Linear search is the simplest searching algorithm. It checks each
              element in the array one by one until it finds the target or
              reaches the end of the array.
            </p>
            <div className="mb-2">
              <span className="font-semibold text-sm">Time Complexity:</span>
              <span className="ml-2 text-sm bg-red-100 dark:bg-red-900 px-2 py-1 rounded-md">
                O(n)
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
              <li>Works on both sorted and unsorted arrays</li>
              <li>
                Compares each element with the target from left to right (or any
                fixed order)
              </li>
              <li>Very simple but inefficient for large arrays</li>
              <li>Useful when the dataset is small or unsorted</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={runLinearSearch}
              disabled={isRunning && !isPaused || array.length === 0 || target === null}
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Search className="h-4 w-4 mr-1" /> Search for{" "}
              {target !== null ? target : "target"}
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
                onClick={isPaused ? resumeSearch : pauseSearch}
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
                onClick={stopSearch}
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
                placeholder="e.g., 5,12,7,3,19,2"
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

          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="custom-target">Custom Target Value</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-target"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder="e.g., 12"
                  disabled={isRunning && !isPaused}
                />
                <Button
                  onClick={handleCustomTarget}
                  disabled={isRunning && !isPaused}
                  variant="outline"
                >
                  Set Target
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="array-size">Array Size</Label>
              <Input
                id="array-size"
                type="number"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                min={5}
                max={30}
                className="w-20"
                disabled={isRunning && !isPaused}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Target
              </h3>
              <p className="text-2xl font-bold">
                {target !== null ? target : "—"}
              </p>
            </Card>
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Current Index
              </h3>
              <p className="text-2xl font-bold">
                {currentIndex >= 0 ? currentIndex : "—"}
              </p>
            </Card>
            <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/30">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Comparisons
              </h3>
              <p className="text-2xl font-bold">{comparisons}</p>
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
                <span
                  className={`text-lg font-bold ${
                    value === target ? "text-amber-200" : "text-white"
                  }`}
                >
                  {value}
                </span>
                <span className="text-xs mt-1 text-slate-200">
                  idx: {index}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-800 border border-slate-600 rounded"></div>
              <span>Unvisited Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-500 rounded border border-blue-300"></div>
              <span>Current Element</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-500 rounded border border-green-300"></div>
              <span>Found Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-amber-400 border border-amber-500 rounded"></div>
              <span>Matches Target Value</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Definition &amp; Step-by-Step Working</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Linear Search</strong> is a searching algorithm that finds the position of a target value within an array by checking each element one by one from the beginning. It returns the first index where the target is found, or indicates that the target is not in the array. No assumption about the order of elements is required.
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-3">Step-by-step working</h3>
        <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
          <li>
            <strong className="text-foreground">Start at the first element.</strong> Set index <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i = 0</code>.
          </li>
          <li>
            <strong className="text-foreground">Compare.</strong> Check if <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[i]</code> equals the target value.
          </li>
          <li>
            <strong className="text-foreground">If equal:</strong> return <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i</code> (element found).
          </li>
          <li>
            <strong className="text-foreground">If not equal:</strong> set <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i = i + 1</code> and repeat from step 2.
          </li>
          <li>
            <strong className="text-foreground">If <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i</code> reaches the length of the array:</strong> stop and report that the target is not present.
          </li>
        </ol>

        <div className="mt-6 p-4 border bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="text-lg font-medium mb-2">When to Use Linear Search</h3>
          <p>
            Linear search is useful when the array is small or unsorted, and when
            simplicity is more important than performance. For large, sorted
            datasets, more efficient algorithms like binary search are preferred.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <CheatSheetDownload
            fileName="linear-search-cheatsheet.txt"
            title="Linear Search"
            definition="Linear Search is a searching algorithm that scans each element in the array one by one from the start and compares it with the target until it is found or the end of the array is reached."
            steps={[
              "Start from the first element at index i = 0.",
              "Compare array[i] with the target value.",
              "If array[i] equals the target, return i as the position where the target was found.",
              "If array[i] does not equal the target, increase i by 1 and repeat the comparison.",
              "If i reaches the array length without any match, conclude that the target is not present in the array.",
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

