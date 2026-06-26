import React, { useState, useEffect } from "react";

import Input from "@/components/Input";
import { Select, Tooltip, UploadFile } from "antd";
import styles from "./index.module.less";
import { useFileList } from "./_hooks";
import {
  FileList,
  AgentToggleButton,
  SendButton,
  StopButton,
  UploadButton,
  AgentToggleConfig,
} from "./_components";
import classNames from "classnames";
import Button, { ButtonProps } from "@/components/Button";
export type { AgentToggleConfig } from "./_components";

export interface AgentConfig {
  key: string;
  open: boolean;
}

export interface ModelConfig {
  label: string;
  value: string;
  /**
   * 该模型支持的功能键列表，用于从 agents 中筛选显示的功能
   * 如果未设置，则显示所有 agents
   */
  agents: AgentConfig[];
  /**
   * 该模型的回答是否包含思考部分
   * 如果为 false，则不处理和显示思考内容
   */
  hasThinking?: boolean;
  [key: string]: unknown;
}

export interface UploadConfig {
  action?: string;
  accept?: string;
  size?: number;
  data?: Record<string, string>;
}

export interface ChatInputProps {
  onSend?: (value: string) => void;
  assistanting?: boolean;
  onStop?: () => void;
  onFileListChange?: (fileList: UploadFile[]) => void;
  fileList?: UploadFile[];
  modelConfig?: {
    modelList: ModelConfig[];
    modelType: string;
    setModelType: (value: string) => void;
  };
  agents?: AgentToggleConfig[];
  /** agents 状态，用于受控模式 */
  agentsState?: AgentConfig[];
  onAgentsChange?: (agents: AgentConfig[]) => void;
  placeholder?: string;
  sendIcon?: string;
  stopIcon?: string;
  uploadConfig?: UploadConfig;
  wrapperClassName?: string;
  onFileInterceptClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  buttonGroup?: ButtonProps[];
  uploadEnabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = (props) => {
  const {
    onSend,
    assistanting,
    onStop,
    onFileListChange,
    fileList: _fileList = [],
    modelConfig,
    agents = [],
    agentsState: externalAgentsState,
    onAgentsChange,
    placeholder = "询问问题",
    sendIcon,
    stopIcon,
    uploadConfig,
    wrapperClassName,
    onFileInterceptClick,
    buttonGroup,
    uploadEnabled = true,
  } = props;

  const [value, setValue] = useState<string>("");
  const [isUpload, setIsUpload] = useState<boolean>(false);
  const { fileList, setFileList } = useFileList(_fileList);

  // 管理 agents 的内部状态（非受控模式）
  const [internalAgentsState, setInternalAgentsState] = useState<AgentConfig[]>(
    () => {
      // 初始化状态：优先从当前模型的 agents 获取，否则从传入的 agents 配置中提取，默认 open 为 true
      const currentModel = modelConfig?.modelList.find(
        (m) => m.value === modelConfig?.modelType
      );
      if (currentModel?.agents && currentModel.agents.length > 0) {
        return currentModel.agents;
      }
      return agents?.map((config) => ({
        key: config.key,
        open: true,
      }));
    }
  );

  // 判断是否为受控模式
  const isControlled = externalAgentsState !== undefined;
  // 使用外部状态或内部状态
  const agentsState = isControlled ? externalAgentsState : internalAgentsState;

  // 当模型切换时，同步更新 agents 状态（仅在非受控模式下）
  useEffect(() => {
    if (isControlled) return; // 受控模式下由外部管理状态

    const currentModel = modelConfig?.modelList.find(
      (m) => m.value === modelConfig?.modelType
    );
    if (currentModel?.agents && currentModel.agents.length > 0) {
      setInternalAgentsState(currentModel.agents);
      onAgentsChange?.(currentModel.agents);
    }
  }, [
    modelConfig?.modelType,
    modelConfig?.modelList,
    onAgentsChange,
    isControlled,
  ]);

  // 根据当前选中的模型，筛选出该模型支持的功能配置
  const currentModel = modelConfig?.modelList.find(
    (m) => m.value === modelConfig?.modelType
  );
  const availableFeatureConfigs = currentModel?.agents
    ? agents.filter((config) =>
        currentModel.agents.some((agent) => agent.key === config.key)
      )
    : agents;

  // 处理 agent 状态切换
  const handleAgentToggle = (key: string) => {
    const newAgentsState = agentsState?.map((agent) =>
      agent.key === key ? { ...agent, open: !agent.open } : agent
    );

    // 受控模式：只通知外部，由外部更新状态
    // 非受控模式：更新内部状态
    if (!isControlled) {
      setInternalAgentsState(newAgentsState);
    }
    onAgentsChange?.(newAgentsState);
  };

  // 获取 agent 的激活状态
  const getAgentActive = (key: string): boolean => {
    return agentsState.find((agent) => agent.key === key)?.open ?? false;
  };

  // 处理文件列表移除
  const handleFileRemove = (uid: string) => {
    const newFileList = fileList.filter((v) => v.uid !== uid);
    setFileList(newFileList);
    onFileListChange?.(newFileList);
  };

  // 处理文件列表变更
  const handleFileListChange = (newFileList: UploadFile[]) => {
    setFileList(newFileList);
    onFileListChange?.(newFileList);
  };

  // 处理发送
  const handleSend = () => {
    if (value.trim() !== "") {
      setValue("");
      onSend?.(value);
    }
  };

  // 处理回车键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !assistanting &&
      value.trim() !== ""
    ) {
      e.preventDefault();
      handleSend();
    }
  };

  // 合并上传配置
  const mergedUploadConfig: UploadConfig = {
    action: uploadConfig?.action,
    accept: uploadConfig?.accept,
    size: uploadConfig?.size ?? 20,
    data: uploadConfig?.data,
  };

  return (
    <div className={classNames(styles.ChatInputWrapper, wrapperClassName)}>
      <div className={styles.ChatInput}>
        <FileList fileList={fileList} onRemove={handleFileRemove} />
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 5 }}
          className={styles.textArea}
          placeholder={placeholder}
          onChange={(v) => {
            if (v.trim() === "") {
              setValue("");
            } else {
              setValue(v);
            }
          }}
          value={value}
          onKeyDown={handleKeyDown}
        />
        <ul className={styles.tool}>
          <ul>
            {modelConfig && (
              <li>
                <Select
                  options={modelConfig?.modelList}
                  value={modelConfig?.modelType}
                  className={styles.select}
                  allowClear={false}
                  onChange={(v) => {
                    modelConfig?.setModelType?.(v);
                  }}
                />
              </li>
            )}
            {availableFeatureConfigs?.map((config) => (
              <AgentToggleButton
                key={config.key}
                config={config}
                active={getAgentActive(config.key)}
                onClick={() => handleAgentToggle(config.key)}
              />
            ))}
          </ul>
          {buttonGroup?.map((button: ButtonProps, idx: number) => (
            <Tooltip title={button.title}>
              <Button
                key={idx}
                {...button}
                title=""
                className={classNames(styles.button, button.className)}
              />
            </Tooltip>
          ))}
          {uploadEnabled && (
            <UploadButton
              onFileListChange={handleFileListChange}
              fileList={fileList}
              uploadConfig={mergedUploadConfig}
              onUploadingChange={setIsUpload}
              onInterceptClick={onFileInterceptClick}
            />
          )}
          <>
            {assistanting ? (
              <StopButton onStop={onStop || (() => {})} stopIcon={stopIcon} />
            ) : (
              <SendButton
                value={value}
                onSend={handleSend}
                sendIcon={sendIcon}
                disabled={isUpload}
              />
            )}
          </>
        </ul>
      </div>
    </div>
  );
};

export default ChatInput;
