import classNames from "classnames";
import styles from "./Popper.module.scss";

const cx = classNames.bind(styles);

function Wrapper() {
  return <div className={cx("wrapper")}>Wrapper</div>;
}

export default Wrapper;
