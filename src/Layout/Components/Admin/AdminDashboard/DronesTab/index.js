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

            <div className={cx("table-container")}>
                <table className={cx("table")}>
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>Status</th>
                            <th>Battery</th>
                            <th>Max Speed (km/h)</th>
                            <th>Payload (kg)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drones.map((drone) => (
                            <tr key={drone.drone_id}>
                                <td>{drone.model}</td>
                                <td>
                                    <span
                                        className={cx("badge", {
                                            success: drone.status === "idle",
                                            warning: drone.status === "delivering" || drone.status === "busy",
                                            danger: drone.status === "maintenance",
                                        })}
                                    >
                                        {drone.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={cx("battery-indicator")}>
                                        <div
                                            className={cx("battery-level", {
                                                low: drone.battery < 20,
                                                medium: drone.battery >= 20 && drone.battery < 60,
                                                high: drone.battery >= 60,
                                            })}
                                            style={{ width: `${drone.battery}%` }}
                                        ></div>
                                        <span>{drone.battery}%</span>
                                    </div>
                                </td>
                                <td>{drone.max_speed}</td>
                                <td>{drone.payload_limit}</td>
                                <td>
                                    <button
                                        className={cx("btn-icon", "edit")}
                                        onClick={() => openEditModal(drone)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={cx("btn-icon", "delete")}
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
                <div className={cx("modal-overlay")}>
                    <div className={cx("modal")}>
                        <div className={cx("modal-header")}>
                            <h3>{editingDrone ? "Edit Drone" : "Add New Drone"}</h3>
                            <button
                                className={cx("close-btn")}
                                onClick={() => setShowModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={cx("form-group")}>
                                <label>Model Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.model}
                                    onChange={(e) =>
                                        setFormData({ ...formData, model: e.target.value })
                                    }
                                />
                            </div>
                            <div className={cx("form-group")}>
                                <label>Battery (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                    value={formData.battery}
                                    onChange={(e) =>
                                        setFormData({ ...formData, battery: e.target.value })
                                    }
                                />
                            </div>
                            <div className={cx("form-group")}>
                                <label>Max Speed (km/h)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.max_speed}
                                    onChange={(e) =>
                                        setFormData({ ...formData, max_speed: e.target.value })
                                    }
                                />
                            </div>
                            <div className={cx("form-group")}>
                                <label>Payload Limit (kg)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.payload_limit}
                                    onChange={(e) =>
                                        setFormData({ ...formData, payload_limit: e.target.value })
                                    }
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
                            <div className={cx("modal-actions")}>
                                <button
                                    type="button"
                                    className={cx("btn", "btn-secondary")}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={cx("btn", "btn-primary")}>
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DronesTab;
