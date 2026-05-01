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
  index: number;
  value: number;
  complement: number;
  action: "check" | "store" | "found" | "done";
  foundPair?: [number, number];
  description: string;
  seenKeys: number[];
};

export default function TwoSumPage() {
  const [array, setArray] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(20);
  const [customTarget, setCustomTarget] = useState<string>("20");
  const [customInput, setCustomInput] = useState<string>("");
  const [arraySize, setArraySize] = useState<number>(10);
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

  const resetRuntime = () => {
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
    const size = Math.min(Math.max(5, arraySize), 18);
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 19) + 1);
    setArray(newArray);
    resetRuntime();
  };

  const handleCustomArray = () => {
    try {
      const numbers = customInput
        .split(",")
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n));
      if (numbers.length > 0) {
        setArray(numbers);
        resetRuntime();
      }
    } catch (e) {
      console.error("Invalid input");
    }
  };

  const handleCustomTarget = () => {
    const parsed = parseInt(customTarget.trim());
    if (!isNaN(parsed)) {
      setTarget(parsed);
      resetRuntime();
    }
  };

  const buildSteps = (arr: number[], t: number): Step[] => {
    const local: Step[] = [];
    const seen = new Map<number, number>(); // value -> index

    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      const complement = t - value;

      local.push({
        index: i,
        value,
        complement,
        action: "check",
        description: `At index ${i}, value = ${value}. Need complement ${complement} to reach target ${t}.`,
        seenKeys: Array.from(seen.keys()),
      });

      if (seen.has(complement)) {
        local.push({
          index: i,
          value,
          complement,
          action: "found",
          foundPair: [seen.get(complement)!, i],
          description: `Found complement ${complement} in seen map. Pair indices: ${seen.get(complement)!} and ${i}.`,
          seenKeys: Array.from(seen.keys()),
        });
        return local;
      }

      seen.set(value, i);
      local.push({
        index: i,
        value,
        complement,
        action: "store",
        description: `Store value ${value} in seen map for future complements.`,
        seenKeys: Array.from(seen.keys()),
      });
    }

    local.push({
      index: -1,
      value: 0,
      complement: 0,
      action: "done",
      description: "Reached end of array. No pair found for the target.",
      seenKeys: Array.from(seen.keys()),
    });

    return local;
  };

  const run = async () => {
    if (isRunning || array.length === 0) return;

    const local = buildSteps(array, target);
    setSteps(local);
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);

    for (let i = 0; i < local.length; i++) {
      setCurrentStep(i);

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

      if (local[i].action === "found") break;
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
  const foundPair = active?.foundPair;

  const getElementClass = (idx: number) => {
    let base =
      "w-14 h-14 flex flex-col items-center justify-center rounded-lg border transition-all duration-300";

    base += " bg-slate-900/40 border-slate-700 text-slate-100";

    if (foundPair && (idx === foundPair[0] || idx === foundPair[1])) {
      base += " ring-2 ring-emerald-300 bg-emerald-600/40 border-emerald-500 scale-105";
    } else if (active && idx === active.index) {
      base += " ring-2 ring-blue-300 bg-blue-600/40 border-blue-500 scale-105";
    }

    return base;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Two Sum (Hash Map) Visualization</h1>

      <div className="flex justify-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-full transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card className="p-6 mb-8 bg-gradient-to-br from-cyan-50 to-violet-50 dark:from-cyan-950/30 dark:to-violet-950/30">
        <h2 className="text-2xl font-semibold mb-4">About Two Sum (Hash Map)</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-cyan-200 dark:border-cyan-800 bg-white/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2 text-cyan-800 dark:text-cyan-300">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Two Sum</strong> asks you to find two indices <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">i</code> and{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">j</code> such that{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">array[i] + array[j] = target</code>.
            The hash map solution scans once while storing previously seen values, giving O(n) time on average.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Complexity</h3>
            <div className="mb-2">
              <span className="font-semibold text-sm">Time Complexity:</span>
              <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">O(n)</span>
            </div>
            <div>
              <span className="font-semibold text-sm">Space Complexity:</span>
              <span className="ml-2 text-sm bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-md">O(n)</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Key Idea</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>For each value x, compute complement = target − x</li>
              <li>If complement is already seen, we found the pair</li>
              <li>Otherwise store x in a map and continue</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={run}
              disabled={isRunning && !isPaused || array.length === 0}
              variant="default"
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Play className="h-4 w-4 mr-1" /> Run Two Sum
            </Button>

            <Button onClick={generateRandomArray} disabled={isRunning && !isPaused} variant="secondary">
              <RefreshCw className="h-4 w-4 mr-1" /> Generate Random Array
            </Button>

            {isRunning && (
              <Button
                onClick={isPaused ? resume : pause}
                variant="outline"
                className="border-amber-500 text-amber-600"
              >
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
                placeholder="e.g., 2,7,11,15"
                disabled={isRunning && !isPaused}
              />
            </div>
            <Button onClick={handleCustomArray} disabled={isRunning && !isPaused} variant="outline">
              Set Custom Array
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="custom-target">Target</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-target"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder="e.g., 9"
                  disabled={isRunning && !isPaused}
                />
                <Button onClick={handleCustomTarget} disabled={isRunning && !isPaused} variant="outline">
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
                max={18}
                className="w-20"
                disabled={isRunning && !isPaused}
              />
            </div>
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

          <div className="mt-4 text-sm text-muted-foreground">
            <strong>Seen map keys:</strong> {active ? (active.seenKeys.length ? active.seenKeys.join(", ") : "—") : "—"}
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Definition &amp; Step-by-Step Working</h2>

        <div className="mb-6 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-2">Definition</h3>
          <p className="text-muted-foreground leading-relaxed">
            The <strong>hash map</strong> approach to Two Sum finds a pair in one pass by storing previously seen values. For each element{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">x</code>, it checks whether{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">target − x</code> was seen earlier.
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-3">Step-by-step working</h3>
        <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
          <li>Create an empty hash map (value → index).</li>
          <li>For each index i from 0 to n−1, let x = array[i].</li>
          <li>Compute complement = target − x.</li>
          <li>If complement exists in the map, return the stored index and i.</li>
          <li>Otherwise, store x in the map and continue.</li>
          <li>If the loop ends, no valid pair exists for the target.</li>
        </ol>

        <div className="mt-6 flex justify-end">
          <CheatSheetDownload
            fileName="two-sum-cheatsheet.txt"
            title="Two Sum (Hash Map)"
            definition="Two Sum (Hash Map) finds two indices i and j such that array[i] + array[j] = target by storing previously seen values and checking complements in O(n) time on average."
            steps={[
              "Create an empty map from value to index.",
              "For each index i, compute complement = target − array[i].",
              "If complement is in the map, return (map[complement], i).",
              "Otherwise store array[i] in the map and continue.",
              "If the loop ends, no pair exists.",
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

