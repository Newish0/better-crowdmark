
// FIXME: React refresh preamble was not loaded. Something is wrong.
// Doing everything in one component until fix. 
export default function ContentSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <h2>{title}</h2>
            {children}
        </section>
    );
}
