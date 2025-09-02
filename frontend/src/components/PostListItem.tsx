import { Link } from "react-router-dom";
import Image from "./Image";

const PostListItem = () => {
  return (
    <div className="flex flex-col xl:flex-row gap-8 mb-12">
      <div className="md:hidden xl:block xl:w-1/3">
        <Image
          src={"postImg.jpeg"}
          className="rounded-2xl object-cover"
          w={735}
        />
      </div>
      <div className="flex flex-col gap-4 xl:w-2/3">
        <Link to={`/`} className="text-4xl font-semibold">
          Web-Development
        </Link>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>Written by</span>
          <Link className="text-blue-800" to={`/posts?author=alex`}>
            alex
          </Link>
          <span>on</span>
          <Link to={"/"} className="text-blue-800">
            Web Development
          </Link>
          <span>2 days ago</span>
        </div>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Corrupti
          voluptatum velit error, eius consequuntur deleniti. Consequatur vel
          reprehenderit earum, quibusdam possimus ipsum perferendis fugit,
          blanditiis odio nulla nobis sit assumenda.
        </p>
        <Link to={`/`} className="underline text-blue-800 text-sm">
          Read More
        </Link>
      </div>
    </div>
  );
};

export default PostListItem;
