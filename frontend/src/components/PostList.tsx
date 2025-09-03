import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import PostListItem from "./PostListItem";

const fetchPosts = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}`);
  return res.data;
};

const PostList = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: () => fetchPosts(),
  });

  if (isLoading) return "Loading...";

  if (error) {
    if (error instanceof Error) {
      return "An error has occurred: " + error.message;
    }
    return "An unknown error occurred";
  }
  return (
    <div>
      <PostListItem />
    </div>
  );
};

export default PostList;
