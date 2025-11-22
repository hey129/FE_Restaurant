import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "../AdminDashboard.module.scss";
import { getCustomers, getAllOrdersAdmin } from "~/Api";
import { useRealtimeData } from "~/hooks/useRealtimeData";

const cx = classNames.bind(styles);

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

function CustomersTab() {
  // Local state management
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load customers and orders on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([loadCustomers(), loadOrders()]);
      } catch (err) {
        console.error("Load data error:", err);
      }
    };
    loadAllData();
  }, []);

  // Listen for real-time changes
  useRealtimeData("customer", () => {
    console.log("[CustomersTab] Customer data changed, reloading...");
    loadCustomers();
  });

  useRealtimeData("orders", () => {
    console.log("[CustomersTab] Order data changed, reloading...");
    loadOrders();
  });

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data || []);
    } catch (err) {
      console.error("Load customers error:", err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data || []);
    } catch (err) {
      console.error("Load orders error:", err);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customer_name
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      customer.phone
        ?.toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      customer.email
        ?.toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      customer.address?.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  return (
    <div className={cx("table-container")}>
      <div className={cx("section-header")}>
        <h2 className={cx("section-title")}>Customer List</h2>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            minWidth: "200px",
          }}
        />
      </div>
      <div className={cx("table-wrapper")}>
        <table className={cx("data-table")}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Created Date</th>
              <th>Số đơn hàng</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => {
              const customerOrders = orders.filter(
                (o) => o.customer_id === customer.customer_id
              );
              return (
                <tr key={customer.customer_id}>
                  <td className={cx("customer-id")}>
                    {customer.customer_id.substring(0, 8)}...
                  </td>
                  <td className={cx("customer-name")}>
                    {customer.customer_name}
                  </td>
                  <td>{customer.phone || "Chưa có"}</td>
                  <td className={cx("address")}>
                    {customer.address || "Chưa có"}
                  </td>
                  <td>{formatDate(customer.created_at)}</td>
                  <td>
                    <span className={cx("order-count")}>
                      {customerOrders.length} đơn
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomersTab;
