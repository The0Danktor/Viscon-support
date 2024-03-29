import { MouseEventHandler } from "react";
import { Link, LinkProps } from "react-router-dom";

interface NavSideButtonProps {
  title?: string;
  svg?: JSX.Element;
  page: LinkProps["to"];
  img?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function NavSideButton(props: NavSideButtonProps) {
  return (
    <Link
      to={props.page}
      onClick={props.onClick}
      className=" h-10 w-72 flex text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md mx-4 px-4"
    >
      {props.svg}
      <p className="m-2">{props.title}</p>
    </Link>
  );
}

export function NavSideButtonLogo(props: NavSideButtonProps) {
  return (
    <Link
      to={props.page}>
      <img src={props.img} className="logo" />
    </Link>
  );
}