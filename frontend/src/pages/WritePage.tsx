import { useAuth } from "@clerk/clerk-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Upload from "../components/Upload";
import { UploadResponse } from "@imagekit/react";

type NewPost = {
  title: string;
  category: string;
  desc: string;
  content: string;
  imageUrl?: string;
};

const Write = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [progress, setProgress] = useState(0);
  const [cover, setCover] = useState<UploadResponse>();

  const mutation = useMutation<any, Error, NewPost>({
    mutationFn: async (newPost) => {
      const token = await getToken();
      return axios.post(`${import.meta.env.VITE_API_URL}/posts`, newPost, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (res) => {
      toast.success("Post created!");
      navigate(`/${res.data.slug}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPost: NewPost = {
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      desc: formData.get("desc") as string,
      content: value,
      imageUrl: cover?.filePath || "",
    };
    mutation.mutate(newPost);
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col gap-6">
      <h1 className="text-cl font-light">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1 mb-6">
        <Upload
          setProgress={setProgress}
          onUploadSuccess={setCover}
          accept="image/*"
        >
          <button className="w-max p-2 shadow-md rounded-xl text-sm text-gray-500 bg-white">
            Add a cover image
          </button>
        </Upload>

        {cover && (
          <img
            src={cover.url}
            alt="Cover preview"
            className="w-64 h-40 object-cover rounded-xl shadow-md"
          />
        )}

        <input
          className="text-4xl font-semibold bg-transparent outline-none"
          type="text"
          placeholder="My Awesome Story"
          name="title"
          required
        />

        <div className="flex items-center gap-4">
          <label className="text-sm">Choose a category:</label>
          <select
            name="category"
            className="p-2 rounded-xl bg-white shadow-md"
            required
          >
            <option value="general">General</option>
            <option value="web-design">Web Design</option>
            <option value="development">Development</option>
            <option value="databases">Databases</option>
            <option value="seo">Search Engines</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>

        <textarea
          className="p-4 rounded-xl bg-white shadow-md"
          name="desc"
          placeholder="A Short Description"
          required
        />

        <div className="flex flex-1 gap-2">
          <div className="flex flex-col gap-2 mr-2">
            <Upload
              setProgress={setProgress}
              onUploadSuccess={(url) =>
                setValue((prev) => prev + `<p><img src="${url}"/></p>`)
              }
              accept="image/*"
            >
              <button className="p-2 shadow-md rounded-xl bg-white">🌆</button>
            </Upload>

            <Upload
              setProgress={setProgress}
              onUploadSuccess={(url) =>
                setValue(
                  (prev) =>
                    prev + `<p><iframe class="ql-video" src="${url}"/></p>`
                )
              }
              accept="video/*"
            >
              <button className="p-2 shadow-md rounded-xl bg-white">▶️</button>
            </Upload>
          </div>
          {/*    ReactQuill stores content as html */}
          <ReactQuill
            theme="snow"
            className="flex-1 rounded-xl bg-white shadow-md"
            value={value}
            onChange={setValue}
            readOnly={0 < progress && progress < 100}
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || (0 < progress && progress < 100)}
          className="bg-blue-800 text-white font-medium rounded-xl mt-4 p-2 w-36 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Loading..." : "Send"}
        </button>

        {mutation.isError && <span>{mutation.error.message}</span>}

        <span className="flex gap-1 mt-2 items-center">
          Upload progress: <progress value={progress} max={100}></progress>
        </span>
      </form>
    </div>
  );
};

export default Write;
