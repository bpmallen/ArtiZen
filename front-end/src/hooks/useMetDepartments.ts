import { useState, useEffect } from "react";

export function useMetDepartments() {
  const [departments, setDepartments] = useState<{ departmentId: number; displayName: string }[]>(
    []
  );

  useEffect(() => {
    fetch("https://collectionapi.metmuseum.org/public/collection/v1/departments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.departments)) {
          setDepartments(data.departments);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch departments:", err);
      });
  }, []);

  return { departments };
}
