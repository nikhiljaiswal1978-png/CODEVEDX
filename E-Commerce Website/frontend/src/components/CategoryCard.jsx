import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/category/${encodeURIComponent(category.name)}`}
      className="category-card"
    >
      <img src={category.image} alt={category.name} />

      <div className="category-info">
        <h3>{category.name}</h3>
        <span>View Products →</span>
      </div>
    </Link>
  );
};

export default CategoryCard;