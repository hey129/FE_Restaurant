import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "../AdminDashboard.module.scss";
import { getDrones, createDrone, updateDrone, deleteDrone } from "~/Api";
import toast from "react-hot-toast";

const cx = classNames.bind(styles);

function DronesTab() {
    const [drones, setDrones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDrone, setEditingDrone] = useState(null);
    const [formData, setFormData] = useState({
        model: "",
        battery: 100,
        max_speed: 60,
        payload_limit: 5,
        status: "idle",
    });

    useEffect(() => {
        loadDrones();
    }, []);

    const loadDrones = async () => {
        try {
            setLoading(true);
            const data = await getDrones();
            setDrones(data);
        } catch (error) {
            console.error("Failed to load drones:", error);
            toast.error("Failed to load drones");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDrone) {
                await updateDrone(editingDrone.drone_id, formData);
                toast.success("Drone updated successfully");
            } else {
                await createDrone(formData);
                toast.success("Drone created successfully");
            }
            setShowModal(false);
            setEditingDrone(null);
            setFormData({
                model: "",
                battery: 100,
                max_speed: 60,
                payload_limit: 5,
                status: "idle",
            });
            loadDrones();
        } catch (error) {
            console.error("Failed to save drone:", error);
            toast.error("Failed to save drone");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this drone?")) {
            try {
                await deleteDrone(id);
                toast.success("Drone deleted successfully");
                loadDrones();
            } catch (error) {
                console.error("Failed to delete drone:", error);
                toast.error("Failed to delete drone");
            }
        }
    };

    const openEditModal = (drone) => {
        setEditingDrone(drone);
        setFormData({
            model: drone.model,
            battery: drone.battery,
            max_speed: drone.max_speed,
            payload_limit: drone.payload_limit,
            status: drone.status,
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingDrone(null);
        setFormData({
            model: "",
            battery: 100,
            max_speed: 60,
            payload_limit: 5,
            status: "idle",
        });
        setShowModal(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={cx("drones-section")}>
            <div className={cx("section-header")}>
                <h2 className={cx("section-title")}>Drone Management</h2>
                <button className={cx("btn", "btn-primary")} onClick={openCreateModal}>
                    Add Drone
                </button>
            </div>



            <div className={cx("table-wrapper")}>
                <table className={cx("data-table")}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Model</th>
                            <th>Status</th>
                            <th>Battery</th>
                            <th>Max Speed</th>
                            <th>Payload</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drones.map((drone) => (
                            <tr key={drone.drone_id}>
                                <td>{drone.drone_id}</td>
                                <td className={cx("product-name")}>{drone.model}</td>
                                <td>
                                    <span
                                        className={cx("status-badge", {
                                            active: drone.status === "idle",
                                            inactive: drone.status === "maintenance",
                                        })}
                                        style={
                                            drone.status === "delivering" || drone.status === "busy"
                                                ? { backgroundColor: "#fef3c7", color: "#92400e" }
                                                : {}
                                        }
                                    >
                                        {drone.status === "idle"
                                            ? "Sẵn sàng"
                                            : drone.status === "delivering"
                                                ? "Đang giao"
                                                : drone.status === "maintenance"
                                                    ? "Bảo trì"
                                                    : drone.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={cx("rating")}>{drone.battery}%</span>
                                </td>
                                <td>{drone.max_speed} km/h</td>
                                <td>{drone.payload_limit} kg</td>
                                <td>
                                    <button
                                        className={cx("btn", "btn-sm", "btn-edit")}
                                        onClick={() => openEditModal(drone)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={cx("btn", "btn-sm", "btn-delete")}
                                        onClick={() => handleDelete(drone.drone_id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className={cx("modal-overlay")} onClick={() => setShowModal(false)}>
                    <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
                        <div className={cx("modal-header")}>
                            <h3>{editingDrone ? "Edit Drone" : "Add New Drone"}</h3>
                            <button
                                className={cx("modal-close")}
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={cx("modal-body")}>
                            <div className={cx("form-group")}>
                                <label>Model Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.model}
                                    onChange={(e) =>
                                        setFormData({ ...formData, model: e.target.value })
                                    }
                                    placeholder="Enter model name"
                                />
                            </div>
                            <div className={cx("form-row")}>
                                <div className={cx("form-group")}>
                                    <label>Battery (%) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        value={formData.battery}
                                        onChange={(e) =>
                                            setFormData({ ...formData, battery: e.target.value })
                                        }
                                        placeholder="100"
                                    />
                                </div>
                                <div className={cx("form-group")}>
                                    <label>Max Speed (km/h) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.max_speed}
                                        onChange={(e) =>
                                            setFormData({ ...formData, max_speed: e.target.value })
                                        }
                                        placeholder="60"
                                    />
                                </div>
                            </div>
                            <div className={cx("form-row")}>
                                <div className={cx("form-group")}>
                                    <label>Payload Limit (kg) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.payload_limit}
                                        onChange={(e) =>
                                            setFormData({ ...formData, payload_limit: e.target.value })
                                        }
                                        placeholder="5"
                                    />
                                </div>
                                <div className={cx("form-group")}>
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value })
                                        }
                                    >
                                        <option value="idle">Idle</option>
                                        <option value="delivering">Delivering</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="charging">Charging</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className={cx("modal-footer")}>
                            <button
                                type="button"
                                className={cx("btn", "btn-secondary")}
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={cx("btn", "btn-primary")}
                                onClick={handleSubmit}
                            >
                                {editingDrone ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DronesTab;
