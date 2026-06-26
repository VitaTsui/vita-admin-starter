/**
 * 将日期浮层挂到当前 antd Modal 的 wrap 上，避免父级 overflow:hidden（如嵌入弹窗）裁切；
 * 与数据资源等大屏 BaseModal 内原先独立弹窗的常见表现一致。非弹窗场景回退 document.body。
 */
export function defaultModalPickerGetPopupContainer(node: HTMLElement) {
  return (node.closest(".ant-modal-wrap") as HTMLElement) ?? document.body;
}
