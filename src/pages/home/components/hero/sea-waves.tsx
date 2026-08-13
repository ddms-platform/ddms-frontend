/**
 * Mặt biển chiếm 30% dưới cùng của hero, phủ ba lớp sóng chồng lên nhau.
 * Ba lớp chạy với tốc độ và chiều khác nhau nên nhìn có chiều sâu thay vì
 * một dải sóng phẳng trượt đều.
 */
export default function SeaWaves() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[30%] bg-linear-to-b from-sea-2 via-sea-3 to-sea-4">
      <div className="ddms-wave ddms-wave--back -top-14 opacity-80" />
      <div className="ddms-wave ddms-wave--mid -top-9.5 opacity-90" />
      <div className="ddms-wave ddms-wave--front z-3 -top-5" />
    </div>
  );
}
