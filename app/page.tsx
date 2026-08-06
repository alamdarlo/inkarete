"use client";

import { useState } from "react";
import { db, Task, Priority } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";


const priorityLabels = {
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
};


export default function Home() {

  const [task, setTask] = useState("");

  const [priority, setPriority] =
    useState<Priority>("medium");


  const [editingId, setEditingId] =
    useState<number | null>(null);


  const [editTitle, setEditTitle] =
    useState("");

  const [editPriority, setEditPriority] =
    useState<Priority>("medium");



  const tasks =
    useLiveQuery(
      () => db.tasks.toArray(),
      []
    ) || [];



  const completed =
    tasks.filter(
      t => t.completed
    ).length;



  const progress =
    tasks.length
      ?
      (completed / tasks.length) * 100
      :
      0;




  const addTask = async () => {

    if (!task.trim())
      return;


    const id =
      await db.tasks.add({

        title: task,

        completed: false,

        priority,

        createdAt:
          new Date().toISOString()

      });



    await db.history.add({

      taskId: id,

      title: task,

      action: "created",

      date:
        new Date()
          .toLocaleString("fa-IR"),

      createdAt:
        Date.now()

    });



    setTask("");

  };




  const toggleTask =
    async (item: Task) => {


      await db.tasks.update(
        item.id!,
        {
          completed:
            !item.completed
        }
      );


    };




  const deleteTask =
    async (item: Task) => {


      await db.history.add({

        taskId: item.id,

        title: item.title,

        action: "deleted",

        date:
          new Date()
            .toLocaleString("fa-IR"),

        createdAt:
          Date.now()

      });



      await db.tasks.delete(
        item.id!
      );


    };




  const startEdit =
    (item: Task) => {

      setEditingId(item.id!);

      setEditTitle(item.title);

      setEditPriority(
        item.priority ?? "medium"
      );

    };




  const saveEdit =
    async (item: Task) => {


      await db.tasks.update(
        item.id!,
        {

          title: editTitle,

          priority: editPriority

        }
      );


      await db.history.add({

        taskId: item.id,

        title: editTitle,

        action: "updated",

        date:
          new Date()
            .toLocaleString("fa-IR"),

        createdAt:
          Date.now()

      });



      setEditingId(null);

    };




  const priorityColor =
    (p: Priority) => {

      if (p === "high")
        return "bg-red-100 text-red-600";

      if (p === "medium")
        return "bg-yellow-100 text-yellow-700";

      return "bg-green-100 text-green-700";

    };




  return (

    <main
      dir="rtl"
      className="
min-h-screen
bg-slate-100
px-3
py-5
sm:px-5
"
    >


      <div
        className="
mx-auto
max-w-xl
"
      >



        <header
          className="
mb-5
"
        >

          <h1
            className="
text-2xl
font-bold
text-slate-800
"
          >
            📋 این کارته
          </h1>


          <p
            className="
mt-1
text-sm
text-slate-500
"
          >
            مدیریت کارهای روزانه
          </p>


          <a
            href="/history"
            className="
mt-3
inline-block
text-sm
text-indigo-600
"
          >
            📜 تاریخچه
          </a>


        </header>





        <section
          className="
mb-4
rounded-xl
bg-white
p-3
shadow-sm
"
        >


          <div
            className="
flex
flex-col
gap-2
sm:flex-row
"
          >


            <input

              value={task}

              onChange={
                e => setTask(e.target.value)
              }

              placeholder="کار جدید..."

              className="
flex-1
rounded-lg
border
px-3
py-2
text-sm
outline-none
focus:ring-2
focus:ring-indigo-500
"

            />



            <select

              value={priority}

              onChange={
                e =>
                  setPriority(
                    e.target.value as Priority
                  )
              }

              className="
rounded-lg
border
px-3
py-2
text-sm
"

            >

              <option value="low">
                کم
              </option>

              <option value="medium">
                متوسط
              </option>

              <option value="high">
                زیاد
              </option>

            </select>



            <button

              onClick={addTask}

              className="
rounded-lg
bg-indigo-600
px-4
py-2
text-sm
text-white
"

            >
              افزودن
            </button>



          </div>

        </section>

        <section
          className="
mb-4
rounded-xl
bg-white
p-3
shadow-sm
"
        >

          <div
            className="
mb-2
flex
justify-between
text-sm
text-slate-600
"
          >

            <span>
              پیشرفت امروز
            </span>

            <span>
              {completed} / {tasks.length}
            </span>

          </div>


          <div
            className="
h-2
overflow-hidden
rounded-full
bg-slate-200
"
          >

            <div

              className="
h-full
rounded-full
bg-emerald-500
transition-all
"

              style={{
                width: `${progress}%`
              }}

            />

          </div>

        </section>





        <div
          className="
space-y-2
"
        >


          {
            tasks.length === 0 &&

            <div
              className="
rounded-xl
bg-white
p-6
text-center
text-sm
text-slate-400
shadow-sm
"
            >
              هنوز کاری اضافه نکردی 🙂
            </div>

          }





          {
            tasks.map(item => (


              <article

                key={item.id}

                className="
rounded-xl
bg-white
p-3
shadow-sm
transition
hover:shadow-md
"

              >


                {

                  editingId === item.id

                    ?


                    <div
                      className="
space-y-2
"
                    >


                      <input

                        value={editTitle}

                        onChange={
                          e => setEditTitle(
                            e.target.value
                          )
                        }

                        className="
w-full
rounded-lg
border
px-3
py-2
text-sm
"

                      />



                      <select

                        value={editPriority}

                        onChange={
                          e =>
                            setEditPriority(
                              e.target.value as Priority
                            )
                        }

                        className="
w-full
rounded-lg
border
px-3
py-2
text-sm
"

                      >

                        <option value="low">
                          کم
                        </option>

                        <option value="medium">
                          متوسط
                        </option>

                        <option value="high">
                          زیاد
                        </option>

                      </select>




                      <div
                        className="
flex
gap-2
"
                      >

                        <button

                          onClick={
                            () => saveEdit(item)
                          }

                          className="
rounded-lg
bg-emerald-600
px-3
py-1.5
text-sm
text-white
"

                        >
                          ذخیره
                        </button>


                        <button

                          onClick={
                            () => setEditingId(null)
                          }

                          className="
rounded-lg
bg-slate-200
px-3
py-1.5
text-sm
"

                        >
                          انصراف
                        </button>


                      </div>


                    </div>


                    :

                    <div>


                      <div
                        className="
flex
items-center
justify-between
gap-3
"
                      >


                        <div
                          className="
flex
min-w-0
items-center
gap-2
"
                        >


                          <input

                            type="checkbox"

                            checked={
                              item.completed
                            }

                            onChange={
                              () => toggleTask(item)
                            }

                            className="
h-4
w-4
accent-emerald-500
"

                          />



                          <span

                            className={`
truncate
text-sm

${item.completed
                                ?
                                "line-through text-slate-400"
                                :
                                "text-slate-700"
                              }

`}

                          >

                            {item.title}

                          </span>


                        </div>





                        <span

                          className={`
shrink-0
rounded-full
px-2.5
py-1
text-xs

${priorityColor(
                            item.priority ?? "medium"
                          )}

`}

                        >

                          {
                            priorityLabels[
                            item.priority ?? "medium"
                            ]
                          }

                        </span>



                      </div>





                      <div
                        className="
mt-3
flex
gap-2
"
                      >


                        <button

                          onClick={
                            () => startEdit(item)
                          }

                          className="
rounded-lg
bg-blue-100
px-3
py-1.5
text-xs
text-blue-700
"

                        >
                          ویرایش
                        </button>




                        <button

                          onClick={
                            () => deleteTask(item)
                          }

                          className="
rounded-lg
bg-red-100
px-3
py-1.5
text-xs
text-red-600
"

                        >
                          حذف
                        </button>


                      </div>



                    </div>


                }


              </article>


            ))
          }


        </div>



      </div>

    </main>

  );

}