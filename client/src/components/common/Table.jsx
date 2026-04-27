import React from "react";

const Table = ({ headers, children }) => {
  return (
    <div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="py-4 px-6 text-sm font-semibold text-slate-500 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
