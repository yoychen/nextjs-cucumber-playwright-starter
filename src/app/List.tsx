"use client";

interface ListItem {
  id: string | number;
  label: string;
}

interface ListProps {
  items: ListItem[];
}

export default function List({ items }: ListProps) {
  const handleItemClick = (item: ListItem) => {
    alert(`You clicked: ${item.label}`);
  };

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => handleItemClick(item)}
          className="p-2 rounded cursor-pointer hover:bg-gray-100"
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
