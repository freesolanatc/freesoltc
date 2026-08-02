"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function MintAddressLookupForm({
  onLookup,
  loading,
}: {
  onLookup: (mintAddress: string) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onLookup(value.trim());
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Label htmlFor="mint-address">Token mint address</Label>
        <Input
          id="mint-address"
          placeholder="Enter the SPL token mint address"
          className="mt-1.5 font-mono"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading || !value.trim()}>
        <Search className="mr-1 h-4 w-4" />
        {loading ? "Looking up..." : "Look up"}
      </Button>
    </form>
  );
}
