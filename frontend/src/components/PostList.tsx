import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import PostListItem, { Post as PostType } from "./PostListItem";
import { useSearchParams } from "react-router-dom";

interface PostsResponse {
  posts: PostType[];
  hasMore: boolean;
}
const fetchPosts = async (
  pageParam = 1,
  searchParams: URLSearchParams
): Promise<PostsResponse> => {
  const searchParamsObj = Object.fromEntries([...searchParams]);
  const res = await axios.get(`${import.meta.env.VITE_API_URL}`, {
    params: { page: pageParam, limit: 2, ...searchParamsObj },
  });
  return res.data;
};

const PostList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, error, fetchNextPage, hasNextPage, status } = useInfiniteQuery<
    PostsResponse,
    Error
  >({
    queryKey: ["posts", searchParams.toString()],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, searchParams),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });

  if (status === "loading") return <p>Loading...</p>;
  if (status === "error") return <p>{error?.message || "Unknown error"}</p>;

  const allPosts: PostType[] = data?.pages.flatMap((page) => page.posts) || [];

  return (
    // @ts-ignore
    <InfiniteScroll
      dataLength={allPosts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h4>Loading more posts...</h4>}
      endMessage={
        <p>
          <b>All posts loaded.</b>
        </p>
      }
    >
      {allPosts.map((post) => {
        return <PostListItem post={post} key={post._id} />;
      })}
    </InfiniteScroll>
  );
};

export default PostList;
