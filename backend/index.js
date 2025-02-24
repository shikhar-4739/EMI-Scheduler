import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

function addMonths(date, months) {
  let newDate = new Date(date);
  if (isNaN(newDate)) {
    throw new Error("Invalid Date format. Use YYYY-MM-DD.");
  }
  newDate.setDate(1);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

app.post("/generate-schedule", (req, res) => {
  try {
    let {
      principal,
      tenure,
      interestRate,
      emiFrequency,
      moratorium,
      disbursementDate,
    } = req.body;

    let startDate = new Date(disbursementDate);
    console.log(startDate);
    if (isNaN(startDate.getTime())) {
      return res
        .status(400)
        .json({ msg: "Invalid disbursement date format. Use YYYY-MM-DD." });
    }

    const P = parseFloat(principal);
    const annualRate = parseFloat(interestRate) / 100;
    const totalMonths = parseInt(tenure);

    let emiGap;
    switch (emiFrequency) {
      case "monthly":
        emiGap = 1;
        break;
      case "quarterly":
        emiGap = 3;
        break;
      case "yearly":
        emiGap = 12;
        break;
      default:
        return res
          .status(400)
          .json({
            msg: "Invalid EMI frequency. Choose monthly, quarterly, or yearly.",
          });
    }

    startDate = addMonths(startDate, moratorium);
    const effectiveMonths = Math.ceil(totalMonths / emiGap);
    const effectiveRate = Math.pow(1 + annualRate, emiGap / 12) - 1;
    console.log("effective Rate:", effectiveRate);

    const EMI =
      (P * effectiveRate * Math.pow(1 + effectiveRate, effectiveMonths)) /
      (Math.pow(1 + effectiveRate, effectiveMonths) - 1);

    let schedule = [];
    let remainingBalance = P;
    let totalInterest = 0;
    let totalPaidAmount = 0;

    for (let i = 1; i <= effectiveMonths; i++) {
      let interest = remainingBalance * effectiveRate;
      let principalPaid = EMI - interest;
      remainingBalance -= principalPaid;

      totalInterest += interest;
      totalPaidAmount += EMI;

      let dueDate = addMonths(startDate, emiGap * i);
      if (isNaN(dueDate.getTime())) {
        return res
          .status(500)
          .json({ msg: "Error calculating due dates. Please check inputs." });
      }

      let formattedDate;
      if (emiFrequency === "monthly") {
        formattedDate =
          new Intl.DateTimeFormat("en-US", { month: "short" }).format(dueDate) +
          "-" +
          dueDate.getFullYear();
      } else if (emiFrequency === "quarterly") {
        formattedDate = `Q${Math.ceil(
          (dueDate.getMonth() + 1) / 3
        )} ${dueDate.getFullYear()}`;
      } else {
        formattedDate = dueDate.getFullYear();
      }

      schedule.push({
        month: i,
        EMI: EMI.toFixed(2),
        principalPaid: principalPaid.toFixed(2),
        interestPaid: interest.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
        dueDate: dueDate.toISOString().split("T")[0],
        formattedDate: formattedDate,
        interestRate: (annualRate * 100).toFixed(2),
      });
    }

    res.json({
      EMI: EMI.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPaidAmount: totalPaidAmount.toFixed(2),
      schedule,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Server error. Please check inputs and try again." });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
