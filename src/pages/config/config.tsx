import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@/components/svg-icon";
import { configRoutes } from "../../routes";

export default function ConfigPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuList, setMenuList] = useState<any[]>([]);

  const cleanMenuList = (menu: any[]): any[] => {
    return menu
      .filter((item) => item.meta)
      .map((item) => ({
        ...item,
        children: item.children ? cleanMenuList(item.children) : undefined,
      }));
  };

  useEffect(() => {
    setMenuList(cleanMenuList(configRoutes.children!));
  }, []);

  const renderMenuItem = (item: any) => {
    if (item.children) {
      return (
        <details open key={item.path}>
          <summary>{t(item.meta.titleKey)}</summary>
          <ul>
            {item.children.map((subItem: any) => (
              <li key={subItem.path}>
                {subItem.children ? (
                  <details open>
                    <summary>{t(subItem.meta?.titleKey)}</summary>
                    <ul>
                      {subItem.children.map((subSubItem: any) => (
                        <li key={subSubItem.path}>
                          <a
                            onClick={() =>
                              navigate(`${item.path}/${subItem.path}/${subSubItem.path}`)
                            }
                            style={{
                              backgroundColor:
                                subSubItem.name === location.pathname
                                  ? "rgba(12,12,12,0.2)"
                                  : undefined,
                            }}
                          >
                            {t(subSubItem.meta?.titleKey)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <a
                    key={subItem.path}
                    onClick={() => navigate(`${item.path}/${subItem.path}`)}
                    style={{
                      backgroundColor:
                        subItem.name === location.pathname ? "rgba(12,12,12,0.2)" : undefined,
                    }}
                  >
                    {t(subItem.meta?.titleKey)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </details>
      );
    }

    return (
      <a
        key={item.path}
        onClick={() => navigate(item.path)}
        style={{
          backgroundColor: item.name === location.pathname ? "rgba(12,12,12,0.2)" : undefined,
        }}
      >
        {t(item.meta?.titleKey)}
      </a>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 min-h-0">
        <aside className="h-full bg-base-200">
          <ul className="w-56 m-0 mr-3 menu pt-14">
            {menuList.map((item) => (
              <li key={item.path}>{renderMenuItem(item)}</li>
            ))}
          </ul>
        </aside>
        <div className="flex-1 px-4 py-8 overflow-y-auto max-w-full">
          <Outlet />
        </div>
      </div>
      <footer className="footer footer-center bg-base-200 text-base-content gap-0">
        <nav className="p-4">
          <div className="grid grid-flow-col gap-4">
            <a
              href="https://github.com/nthung2112/nth-lottery"
              target="_blank"
              className="cursor-pointer text-inherit"
            >
              <SvgIcon name="Github" />
            </a>
            <a href="https://twitter.com/nthung2112" target="_blank" className="cursor-pointer">
              <SvgIcon name="Twitter" />
            </a>
            <a
              href="https://www.instagram.com/nthung2112/"
              target="_blank"
              className="cursor-pointer"
            >
              <SvgIcon name="Instagram" />
            </a>
          </div>
        </nav>
        <aside>
          <p>Copyright © {new Date().getFullYear()} - All right reserved by nthung2112</p>
        </aside>
      </footer>
    </div>
  );
}
