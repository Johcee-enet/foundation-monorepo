import React, { FC } from "react";

import HeaderNavigation from "./HeaderNavigation";

const Header: FC<{ nickname: string | undefined }> = ({ nickname }) => {
  return (
    <header className="header">
      <div className="flex items-center gap-2.5">
        <h3 className="font-semibold  text-black dark:text-white">
          Welcome {nickname ?? "Guest"}
          {/* Usersname information passed down to the dashboard */}
        </h3>
      </div>
      <HeaderNavigation />
    </header>
  );
};

export default Header;
