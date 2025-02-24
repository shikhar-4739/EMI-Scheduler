import React, { useRef, useState } from "react";
import { Input } from "./ui/input";
import axios from "axios";
import Charts from "./charts";
import TableData from "./tableData";
import jsPDF from "jspdf";
import "jspdf-autotable";

const InputForm = () => {
  const [schedule, setSchedule] = useState(null);
  const [data, setData] = useState(null);
  const [loanDetails, setLoanDetails] = useState({
    principal: "",
    tenure: "",
    interestRate: "",
    emiFrequency: "monthly",
    moratorium: "",
    disbursementDate: new Date().toISOString().split("T")[0],
  });

  const Ref = useRef(null);

  const handleChange = (e) => {
    setLoanDetails({ ...loanDetails, [e.target.name]: e.target.value });
  };

  const downloadPDF = () => {
    if (!schedule) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Loan Repayment Schedule Generator", 14, 22);

    const inputParameters = [
      ["Principal Amount", loanDetails.principal],
      ["Tenure (Months)", loanDetails.tenure],
      ["Interest Rate (%)", loanDetails.interestRate],
      ["EMI Frequency", loanDetails.emiFrequency],
      ["Moratorium (Months)", loanDetails.moratorium],
      ["Disbursement Date", loanDetails.disbursementDate],
      ["EMI", data.EMI],
      ["Total Interest Payable", data.totalInterest],
      ["Total Payment (Principal + Interest)", data.totalPaidAmount],
    ];

    doc.setFontSize(12);
    inputParameters.forEach((param, index) => {
      doc.text(`${param[0]}: ${param[1]}`, 14, 32 + index * 10);
    });
    
    const headers = [
      "Month/Year",
      "EMI",
      "Principal Paid",
      "Interest Paid",
      "Interest %",
      "Remaining Principal",
    ];

    const rows = schedule.map((entry) => [
      entry.formattedDate,
      entry.EMI,
      entry.principalPaid,
      entry.interestPaid,
      entry.interestRate,
      entry.remainingBalance,
    ]);

    doc.autoTable({
      startY: 32 + inputParameters.length * 10 + 10,
      head: [headers],
      body: rows,
    });

    doc.save("loan_repayment_schedule.pdf");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Loan Details", loanDetails);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/generate-schedule`,
        loanDetails
      );
      setSchedule(response.data.schedule);
      setData(response.data);
      Ref.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error fetching schedule", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center container mx-auto px-4 sm:px-6 lg:px-8">
      <section className="w-full max-w-lg mx-auto p-6 bg-gray-800 border border-gray-200 rounded-lg shadow-lg ">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 text-center">Loan Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="principal" className="mb-1 font-medium">
              * Principal Amount
            </label>
            <Input
              type="number"
              name="principal"
              placeholder="Principal Amount"
              onChange={handleChange}
              min="0"
              className="w-full p-2 border-2 border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="tenure" className="mb-1 font-medium">
              * Time Period (Months)
            </label>
            <Input
              type="number"
              name="tenure"
              placeholder="Tenure (Months)"
              onChange={handleChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="interestRate" className="mb-1 font-medium">
              * Interest Rate (%)
            </label>
            <Input
              type="number"
              name="interestRate"
              placeholder="Interest Rate (%)"
              onChange={handleChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="interestRate" className="mb-1 font-medium">
              * Starting Date
            </label>
            <Input
              type="date"
              name="disbursementDate"
              value={loanDetails.disbursementDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="moratorium" className="mb-1 font-medium">
              Moratorium (Months)
            </label>
            <Input
              type="number"
              name="moratorium"
              placeholder="Moratorium (Months)"
              onChange={handleChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="emiFrequency" className="mb-1 font-medium">
              EMI Frequency
            </label>
            <select
              name="emiFrequency"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 bg-gray-300 rounded text-black"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
          >
            Generate Schedule
          </button>
        </form>
      </section>

      <section  className="w-full mt-10">
        <div ref={Ref} className="w-full md:w-3/4 flex flex-col mx-auto">
          { schedule &&
            <Charts schedule={schedule} loanDetails={loanDetails} data={data}/>
          }
        </div>
      </section>

      <section  className="w-full mt-10">
        <div className="w-full md:w-3/4 flex flex-col mx-auto">
        {schedule && (
          <>
          <div className="flex flex-row justify-between items-center mb-6">
            <h1 className="text-xl md:text-2xl text-center mt-4">Loan Repayment Schedule</h1>
            <button
              onClick={downloadPDF}
              className=" py-2 px-4 mt-4 bg-green-500 text-white font-bold rounded hover:bg-green-600"
            >
              Download
            </button>
          </div>
          <TableData schedule={schedule} loanDetails={loanDetails} />
          </>
          )}
        </div>
      </section>
    </div>
  );
};

export default InputForm;
