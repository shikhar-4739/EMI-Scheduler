import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const TableData = ({ schedule, loanDetails }) => {
  console.log(schedule);
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-center">
              {loanDetails.emiFrequency == "monthly" ? "Month" : "Year"}
            </TableHead>
            <TableHead className="text-right">EMI</TableHead>
            <TableHead className="text-right">Principal Paid</TableHead>
            <TableHead className="text-right">Interest Paid</TableHead>
            <TableHead className="text-right">Interest %</TableHead>
            <TableHead className="text-right">Remaining Principal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((entry, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-center">
                {entry.formattedDate}
              </TableCell>
              <TableCell className="text-right">{entry.EMI}</TableCell>
              <TableCell className="text-right">
                {entry.principalPaid}
              </TableCell>
              <TableCell className="text-right">{entry.interestPaid}</TableCell>
              <TableCell className="text-right">
                {entry.interestRate} %
              </TableCell>
              <TableCell className="text-right">
                {entry.remainingBalance}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableData;
