import Registry from "~/Layout/Components/Customer/Registry";
import classNames from "classnames/bind";
import styles from "./Registry.module.scss";

const cx = classNames.bind(styles);
export default function RegistryPage() {
  return (
    <div className={cx("container")}>
      <div className={cx("Registry")}>
        <Registry />
      </div>
    </div>
  );
}
