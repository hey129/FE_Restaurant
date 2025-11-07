import { useState, forwardRef } from "react";
import classNames from "classnames/bind";
import images from "~/Assest/Images";

const cx = classNames.bind();
const Image = forwardRef(
  ({ src, alt, fallBack: customeFallback = images.noImage, ...props }, ref) => {
    const [fallBack, setFallBack] = useState("");

    const handleError = () => {
      setFallBack(images.noImage);
    };

    return (
      <img
        className={cx("img")}
        ref={ref}
        src={fallBack || src}
        alt={alt}
        {...props}
        onError={handleError}
      />
    );
  }
);

export default Image;
