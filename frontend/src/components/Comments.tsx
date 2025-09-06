import axios, { AxiosError, AxiosResponse } from "axios";
import Comment, { CommentType } from "./Comment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";

interface NewComment {
  desc: string | null;
}

const fetchComments = async (postId: string) => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/comments/${postId}`
  );
  return res.data;
};

const Comments = ({ postId }: { postId: string }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  if (!user) {
    return <p>You must be logged in to comment.</p>;
  }

  const { isLoading, error, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, AxiosError, NewComment>({
    mutationFn: async (newComment) => {
      const token = await getToken();
      return axios.post(
        `${import.meta.env.VITE_API_URL}/comments/${postId}`,
        newComment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error: AxiosError) => {
      if (error.response) {
        toast.error(error.response.data as string);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: NewComment = {
      desc: formData.get("desc") as string | null,
    };

    mutation.mutate(data);
  };
  return (
    <div className="flex flex-col gap-8 lg:w-3/5 mb-12">
      <h1 className="text-xl text-gray-500 underline">Comments</h1>
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-between gap-8 w-full"
      >
        <textarea
          name="desc"
          placeholder="Write a comment..."
          className="w-full p-4 rounded-xl"
        />
        <button className="bg-blue-800 px-4 py-3 text-white font-medium rounded-xl">
          Send
        </button>
      </form>
      {isLoading ? (
        "Loading..."
      ) : error ? (
        "Error loading comments!"
      ) : (
        <>
          {mutation.isPending && (
            <Comment
              comment={{
                _id: "optimistic-id",
                post: postId,
                desc: `${mutation.variables?.desc} (Sending...)`,
                createdAt: new Date(),
                user: {
                  clerkUserId: user.id,
                  username: user.username ?? "Anonymous",
                  savedPosts: "",
                  img: user.imageUrl,
                },
              }}
              postId={postId}
            />
          )}

          {data.map((comment: CommentType) => (
            <Comment key={comment._id} comment={comment} postId={postId} />
          ))}
        </>
      )}
    </div>
  );
};

export default Comments;
