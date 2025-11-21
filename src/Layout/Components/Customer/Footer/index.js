import classNames from "classnames/bind";
import styles from "./Footer.module.scss";

const cx = classNames.bind(styles);

function Footer() {
  return (
    <section className={cx("footer")}>
      <div className={cx("container")}>
        <div className={cx("grid")}>
          {/* Logo + mô tả + mạng xã hội */}
          <div className={cx("about")}>
            {/* Logo */}
            <div className={cx("logo")}>
              <a href="#" title="Home">
                PIZZA
              </a>
            </div>
            <p className={cx("description")}>
              Cửa hàng bán đồ ăn nhanh, thức ăn vặt, đồ uống...
            </p>

            <ul className={cx("socials")}>
              <li>
                <a href="#" className={cx("social-link")}>
                  <svg
                    className={cx("icon")}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z" />
                  </svg>
                </a>
              </li>
              {/* Các icon khác giữ nguyên như HTML gốc */}
            </ul>
          </div>

          {/* Cột Company */}
          <div>
            <p className={cx("title")}>Company</p>
            <ul className={cx("link-list")}>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Features</a>
              </li>
              <li>
                <a href="#">Works</a>
              </li>
              <li>
                <a href="#">Career</a>
              </li>
            </ul>
          </div>

          {/* Cột Help */}
          <div>
            <p className={cx("title")}>Help</p>
            <ul className={cx("link-list")}>
              <li>
                <a href="#">Customer Support</a>
              </li>
              <li>
                <a href="#">Delivery Details</a>
              </li>
              <li>
                <a href="#">Terms & Conditions</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className={cx("divider")} />
        <p className={cx("copyright")}>
          © Copyright 2021, All Rights Reserved by Pizza
        </p>
      </div>
    </section>
  );
}

export default Footer;
