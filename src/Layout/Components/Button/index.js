import styles from "./Button.module.scss";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import axios from "axios";
const cx = classNames.bind(styles);

function Button({
  to,
  href,
  primary = false,
  outline = false,
  disabled = false,
  small = false,
  children,
  onClick,
  ...passProps
}) {
  let Comp = "button";
  const props = { onClick, ...passProps, outline, disabled, small };
  if (to) {
    props.to = to;
    Comp = Link;
  } else if (href) {
    props.href = href;
    Comp = "a";
  }
  const classes = cx("wrapper", { primary });
  return (
    <Comp className={classes} {...props}>
      <span>{children}</span>
    </Comp>
  );
}
export default Button;
