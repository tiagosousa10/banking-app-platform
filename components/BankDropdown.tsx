"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { formUrlQuery, formatAmount } from "@/lib/utils";

export const BankDropdown = ({
  accounts = [],
  setValue,
  otherStyles,
}: BankDropdownProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selected, setSeclected] = useState<Account | undefined>(accounts[0]);

  useEffect(() => {
    if (!accounts.length || selected) return;

    const firstAccount = accounts[0];
    setSeclected(firstAccount);

    if (setValue) {
      setValue("senderBank", firstAccount.appwriteItemId);
    }
  }, [accounts, selected, setValue]);

  if (!accounts.length) {
    return (
      <div className={`flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-14 text-gray-500 ${otherStyles}`}>
        <div className="flex items-center gap-3">
          <Image
            src="icons/credit-card.svg"
            width={20}
            height={20}
            alt="account"
          />
          <p>No bank accounts yet</p>
        </div>
        <button
          type="button"
          className="text-blue-600"
          onClick={() => router.push("/")}
        >
          Add one
        </button>
      </div>
    );
  }

  const handleBankChange = (id: string) => {
    const account = accounts.find((account) => account.appwriteItemId === id);

    if (!account) return;

    setSeclected(account);
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: id,
    });
    router.push(newUrl, { scroll: false });

    if (setValue) {
      setValue("senderBank", id);
    }
  };

  return (
    <Select
      defaultValue={selected?.id}
      onValueChange={(value) => handleBankChange(value)}
    >
      <SelectTrigger
        className={`flex w-full bg-white gap-3 md:w-[300px] ${otherStyles}`}
      >
        <Image
          src="icons/credit-card.svg"
          width={20}
          height={20}
          alt="account"
        />
        <p className="line-clamp-1 w-full text-left">
          {selected?.name ?? "Select a bank"}
        </p>
      </SelectTrigger>
      <SelectContent
        className={`w-full bg-white md:w-[300px] ${otherStyles}`}
        align="end"
      >
        <SelectGroup>
          <SelectLabel className="py-2 font-normal text-gray-500">
            Select a bank to display
          </SelectLabel>
          {accounts.map((account: Account) => (
            <SelectItem
              key={account.id}
              value={account.appwriteItemId}
              className="cursor-pointer border-t"
            >
              <div className="flex flex-col ">
                <p className="text-16 font-medium">{account.name}</p>
                <p className="text-14 font-medium text-blue-600">
                  {formatAmount(account.currentBalance)}
                </p>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
