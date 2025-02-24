import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Charts = ({ schedule, loanDetails, data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const COLORS = ["#0088FE", "#00C49F"];

  const pieData = [
    { name: "Principal Amount", value: parseFloat(loanDetails.principal) },
    {
      name: "Total Interest Paid",
      value: schedule
        ? parseFloat(
            schedule
              .reduce((acc, entry) => acc + parseFloat(entry.interestPaid), 0)
              .toFixed(2)
          )
        : 0,
    },
  ];

  const barData = schedule
    ? schedule.reduce((acc, entry) => {
        const year = entry.dueDate.split("-")[0];
        const existingYear = acc.find((item) => item.year === year);
        if (existingYear) {
          existingYear.principalPaid += parseFloat(entry.principalPaid);
          existingYear.interestPaid += parseFloat(entry.interestPaid);
        } else {
          acc.push({
            year,
            principalPaid: parseFloat(entry.principalPaid),
            interestPaid: parseFloat(entry.interestPaid),
          });
        }
        return acc;
      }, [])
    : [];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-gray-800 text-white p-2 rounded">
          <p className="label text-sm">Year: {`${label}`}</p>
          <p className="label text-sm">Principal: {`₹ ${payload[0].value}`}</p>
          <p className="label text-sm">Interest: {`₹ ${payload[1].value}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row border rounded-md items-center justify-between p-4 md:p-10">
        <div className="w-full md:w-1/3 text-[#999] ml-0 lg:ml-20">
          <div className="rounded-md border border-white">
            <div className="border-b border-white p-4 text-center">
              <h1>Loan EMI</h1>
              <p className=" text-2xl font-medium text-white">₹ {data.EMI}</p>
            </div>
            <div className="border-b border-white p-4 text-center">
              <h1>Total Interest Payable</h1>
              <p className=" text-2xl font-medium text-white">
                ₹ {data.totalInterest}
              </p>
            </div>
            <div className="border-b border-white p-4 text-center">
              <h1 className="leading-none">
                Total Payment <br /> (Principal + Interest)
              </h1>
              <p className="pt-1 text-2xl font-medium text-white">
                ₹ {data.totalPaidAmount}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center w-full md:w-2/3">
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx={200}
              cy={200}
              labelLine={false}
              outerRadius={150}
              innerRadius={100}
              fill="#8884d8"
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={(props) => {
                const RADIAN = Math.PI / 180;
                const {
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  startAngle,
                  endAngle,
                  fill,
                  payload,
                  percent,
                  value,
                } = props;
                const sin = Math.sin(-RADIAN * midAngle);
                const cos = Math.cos(-RADIAN * midAngle);
                const sx = cx + (outerRadius + 10) * cos;
                const sy = cy + (outerRadius + 10) * sin;
                const mx = cx + (outerRadius + 30) * cos;
                const my = cy + (outerRadius + 30) * sin;
                const ex = mx + (cos >= 0 ? 1 : -1) * 22;
                const ey = my;
                const textAnchor = cos >= 0 ? "start" : "end";

                return (
                  <g>
                    <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                      {payload.name}
                    </text>
                    <Sector
                      cx={cx}
                      cy={cy}
                      innerRadius={innerRadius}
                      outerRadius={outerRadius}
                      startAngle={startAngle}
                      endAngle={endAngle}
                      fill={fill}
                    />
                    <Sector
                      cx={cx}
                      cy={cy}
                      startAngle={startAngle}
                      endAngle={endAngle}
                      innerRadius={outerRadius + 6}
                      outerRadius={outerRadius + 10}
                      fill={fill}
                    />
                    <path
                      d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                      stroke={fill}
                      fill="none"
                    />
                    <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                    <text
                      x={ex + (cos >= 0 ? 1 : -1) * 12}
                      y={ey}
                      textAnchor={textAnchor}
                      fill="#999"
                    >{`₹${value}`}</text>
                    <text
                      x={ex + (cos >= 0 ? 1 : -1) * 12}
                      y={ey}
                      dy={18}
                      textAnchor={textAnchor}
                      fill="#999"
                    >
                      {`(${(percent * 100).toFixed(2)}%)`}
                    </text>
                  </g>
                );
              }}
              onMouseEnter={onPieEnter}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Legend />
          </PieChart>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 text-center text-[#999]">
          EMI Payable year wise
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `₹${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="principalPaid" fill="#8884d8" />
            <Bar dataKey="interestPaid" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default Charts;
